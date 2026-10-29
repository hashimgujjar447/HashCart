import { NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';
import crypto from 'node:crypto';
import { ValidationError, AuthError } from '../../../../packages/error-handler';
import { redisClient } from '../../../../packages/redis/redis';
import prisma from '../../../../packages/libs/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as any,
});

export const createPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { cart, selectedAddress, coupon, coupen } = req.body;
    const activeCoupon = coupon || coupen;

    const userId = req.user?.id;
    if (!userId) {
      return next(new AuthError('Unauthorized: Please login to checkout'));
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return next(new ValidationError('Cart is empty or invalid'));
    }

    if (!selectedAddress) {
      return next(new ValidationError('Shipping address is required'));
    }

    const uniqueShopIds = [
      ...new Set(
        cart.map((item: any) => item.shopId || item.shop?.id).filter(Boolean),
      ),
    ];

    const shops = await prisma.shops.findMany({
      where: { id: { in: uniqueShopIds as string[] } },
      select: {
        id: true,
        name: true,
        sellerId: true,
        sellers: {
          select: {
            id: true,
            stripeId: true,
          },
        },
      },
    });

    const sellerData = shops.map((s) => ({
      shopId: s.id,
      shopName: s.name,
      sellerId: s.sellerId,
      stripeId: s.sellers?.stripeId || null,
    }));

    let subtotal = 0;
    cart.forEach((item: any) => {
      const price = Number(item.sale_price ?? item.price ?? 0);
      const qty = Number(item.quantity ?? 1);
      subtotal += price * qty;
    });

    let discountAmount = 0;
    if (activeCoupon) {
      if (
        activeCoupon.discountType === 'percentage' ||
        activeCoupon.discountPercentage
      ) {
        const pct = Number(
          activeCoupon.discountPercentage ?? activeCoupon.discountValue ?? 0,
        );
        discountAmount = Math.round(((subtotal * pct) / 100) * 100) / 100;
      } else if (activeCoupon.discountValue) {
        discountAmount = Number(activeCoupon.discountValue);
      }
    }

    const totalAmount = Math.max(
      0,
      Math.round((subtotal - discountAmount) * 100) / 100,
    );

    const sessionId = crypto.randomUUID();

    const sessionData = {
      sessionId,
      userId,
      cart,
      sellers: sellerData,
      subtotal,
      discountAmount,
      totalAmount,
      coupon: activeCoupon || null,
      selectedAddress,
      createdAt: new Date().toISOString(),
    };

    await redisClient.set(
      `payment-session:${sessionId}`,
      JSON.stringify(sessionData),
      { EX: 1800 },
    );

    await redisClient.set(`user-payment-session:${userId}`, sessionId, {
      EX: 1800,
    });

    return res.status(200).json({
      success: true,
      sessionId,
      subtotal,
      discountAmount,
      totalAmount,
      sellers: sellerData,
      cart,
      selectedAddress,
    });
  } catch (error) {
    return next(error);
  }
};

export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { amount, sessionId } = req.body;

    // 1. Amount check karein
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return next(new ValidationError('Valid amount is required'));
    }

    // 2. Stripe cents leta hai ($60.00 -> 6000 cents)
    const customerAmount = Math.round(parsedAmount * 100);

    // 3. Stripe se PaymentIntent banwayein
    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        sessionId: sessionId || '',
        userId: (req.user as any)?.id || '',
      },
    });

    // 4. Frontend ko clientSecret aur paymentIntentId wapas bhej dein
    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    return next(error);
  }
};
const processOrderCreation = async (
  sessionData: any,
  paymentIntentId: string,
  paymentMethod = 'card',
) => {
  const { cart, shippingAddress, coupon, userId } = sessionData;

  const existingOrders = await prisma.orders.findMany({
    where: { paymentIntentId },
  });
  if (existingOrders.length > 0) {
    return existingOrders;
  }

  const shopGroups = cart.reduce((groups: any, item: any) => {
    const sId = item.shopId || item.shop?.id || 'default';
    if (!groups[sId]) {
      groups[sId] = [];
    }
    groups[sId].push(item);
    return groups;
  }, {});

  return await prisma.$transaction(async (tx) => {
    const createdOrders = [];

    for (const shopIdKey in shopGroups) {
      const items = shopGroups[shopIdKey];
      const orderShopId = shopIdKey === 'default' ? null : shopIdKey;

      let orderTotal = items.reduce(
        (acc: number, item: any) =>
          acc +
          Number(item.sale_price ?? item.price ?? 0) *
            Number(item.quantity ?? 1),
        0,
      );

      let shopDiscount = 0;
      if (coupon) {
        if (coupon.discountType === 'percentage' || coupon.discountPercentage) {
          const pct = Number(
            coupon.discountPercentage ?? coupon.discountValue ?? 0,
          );
          shopDiscount = Math.round(((orderTotal * pct) / 100) * 100) / 100;
        } else if (coupon.discountValue) {
          shopDiscount = Number(coupon.discountValue);
        }
        orderTotal = Math.max(
          0,
          Math.round((orderTotal - shopDiscount) * 100) / 100,
        );
      }

      const orderItemsJson = items.map((item: any) => ({
        productId: item.id || item.productId,
        title: item.title,
        image: item.image || item.images?.[0]?.url || '',
        price: Number(item.sale_price ?? item.price ?? 0),
        quantity: Number(item.quantity ?? 1),
        shopId: orderShopId,
        selectedOptions: item.selectedOptions || {},
      }));

      const isCOD =
        paymentMethod.toLowerCase() === 'cod' ||
        paymentMethod.toLowerCase() === 'cash_on_delivery';
      const initialStatus = isCOD ? 'Pending' : 'Processing';
      const initialPaymentStatus = isCOD ? 'Pending' : 'Paid';

      const order = await tx.orders.create({
        data: {
          userId,
          shopId: orderShopId,
          totalAmount: orderTotal,
          discountAmount: shopDiscount,
          status: initialStatus,
          paymentStatus: initialPaymentStatus,
          paymentMethod,
          paymentIntentId,
          couponCode: coupon?.code || coupon?.discountCode || null,
          shippingAddress: shippingAddress || null,
          items: orderItemsJson,
        },
      });

      createdOrders.push(order);

      for (const item of items) {
        const pId = item.id || item.productId;
        const qty = Number(item.quantity ?? 1);
        if (pId) {
          await tx.products.update({
            where: { id: pId },
            data: {
              stock: { decrement: qty },
              totalSales: { increment: qty },
            },
          });

          try {
            await tx.productAnalytics.upsert({
              where: { productId: pId },
              update: { purchases: { increment: qty } },
              create: { productId: pId, shopId: orderShopId, purchases: qty },
            });
          } catch (err) {
            // non-blocking
          }
        }
      }

      if (orderShopId) {
        try {
          await tx.shopAnalytics.upsert({
            where: { shopId: orderShopId },
            update: { purchases: { increment: items.length } },
            create: { shopId: orderShopId, purchases: items.length },
          });
        } catch (err) {
          // non-blocking
        }
      }
    }

    return createdOrders;
  });
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stripeSignature = req.headers['stripe-signature'] as string;

    if (!stripeSignature) {
      return next(new ValidationError('Stripe signature header is missing'));
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      return next(
        new ValidationError('Raw body not captured for webhook verification'),
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata?.sessionId;

      if (!sessionId) {
        return res
          .status(200)
          .json({ received: true, note: 'No sessionId in metadata' });
      }

      const sessionKey = `payment-session:${sessionId}`;
      const sessionDataString = await redisClient.get(sessionKey);

      if (!sessionDataString) {
        return res.status(200).json({
          received: true,
          note: 'Session already consumed or expired',
        });
      }

      const sessionData = JSON.parse(sessionDataString);
      if (!sessionData.userId && paymentIntent.metadata?.userId) {
        sessionData.userId = paymentIntent.metadata.userId;
      }

      await processOrderCreation(sessionData, paymentIntent.id, 'card');

      await redisClient.del(sessionKey);
      if (sessionData.userId) {
        await redisClient.del(`user-payment-session:${sessionData.userId}`);
      }

      return res.status(200).json({ received: true });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return next(error);
  }
};

export const verifyPaymentAndCreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sessionId, paymentIntentId } = req.body;
    const userId = req.user?.id;

    if (!sessionId || !paymentIntentId) {
      return next(
        new ValidationError('Session ID and Payment Intent ID are required'),
      );
    }

    let paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (
      paymentIntent.status === 'requires_payment_method' ||
      paymentIntent.status === 'requires_confirmation'
    ) {
      try {
        paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: 'pm_card_visa',
        });
      } catch (confirmErr: any) {
        console.warn('PaymentIntent confirmation note:', confirmErr.message);
      }
    }

    if (paymentIntent.status !== 'succeeded') {
      return next(
        new ValidationError(
          `Payment not completed. Current status: ${paymentIntent.status}`,
        ),
      );
    }

    const existingOrders = await prisma.orders.findMany({
      where: { paymentIntentId },
    });
    if (existingOrders.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Order already created',
        orders: existingOrders,
      });
    }

    const sessionKey = `payment-session:${sessionId}`;
    const sessionDataString = await redisClient.get(sessionKey);

    if (!sessionDataString) {
      return next(
        new ValidationError(
          'Checkout session has expired. Please try placing your order again.',
        ),
      );
    }

    const sessionData = JSON.parse(sessionDataString);
    if (userId && !sessionData.userId) {
      sessionData.userId = userId;
    }

    const orders = await processOrderCreation(
      sessionData,
      paymentIntentId,
      'card',
    );

    await redisClient.del(sessionKey);
    if (sessionData.userId) {
      await redisClient.del(`user-payment-session:${sessionData.userId}`);
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orders,
    });
  } catch (error) {
    return next(error);
  }
};

export const createDirectOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(
        new AuthError('Unauthorized: Please login to place an order'),
      );
    }

    const {
      cart,
      shippingAddress,
      coupon,
      coupen,
      paymentMethod = 'COD',
    } = req.body;
    const activeCoupon = coupon || coupen;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return next(new ValidationError('Cart is empty or invalid'));
    }

    if (!shippingAddress) {
      return next(new ValidationError('Shipping address is required'));
    }

    const sessionData = {
      cart,
      shippingAddress,
      coupon: activeCoupon,
      userId,
    };

    const directReference = `direct_${crypto.randomUUID()}`;
    const orders = await processOrderCreation(
      sessionData,
      directReference,
      paymentMethod,
    );

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orders,
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AuthError('User not authenticated'));
    }

    const [ordersList, total, processingCount, completedCount] =
      await Promise.all([
        prisma.orders.findMany({
          where: { userId },
          include: {
            shop: {
              select: {
                id: true,
                name: true,
                avatar: true,
                address: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.orders.count({ where: { userId } }),
        prisma.orders.count({ where: { userId, status: 'Processing' } }),
        prisma.orders.count({ where: { userId, status: 'Completed' } }),
      ]);

    return res.status(200).json({
      success: true,
      orders: ordersList,
      stats: {
        totalOrders: total,
        processingOrders: processingCount,
        completedOrders: completedCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const sellerId = req.seller?.id;

    if (!id) {
      return next(new ValidationError('Order ID is required'));
    }

    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
            avatar: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
            avatar: true,
            sellerId: true,
          },
        },
      },
    });

    if (!order) {
      return next(new ValidationError('Order not found'));
    }

    const isBuyer = userId && order.userId === userId;
    const isShopOwner = sellerId && order.shop?.sellerId === sellerId;

    if (!isBuyer && !isShopOwner) {
      return next(
        new AuthError('Unauthorized: You do not have access to this order'),
      );
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSellerOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller?.id;
    if (!sellerId) {
      return next(new AuthError('Seller not authenticated'));
    }

    const shop = await prisma.shops.findUnique({
      where: { sellerId },
    });

    if (!shop) {
      return next(new ValidationError('Shop not found for this seller'));
    }

    const [orders, total, processingCount, deliveredCount, cancelledCount] =
      await Promise.all([
        prisma.orders.findMany({
          where: { shopId: shop.id },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone_number: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.orders.count({ where: { shopId: shop.id } }),
        prisma.orders.count({
          where: { shopId: shop.id, status: 'Processing' },
        }),
        prisma.orders.count({
          where: { shopId: shop.id, status: 'Delivered' },
        }),
        prisma.orders.count({
          where: { shopId: shop.id, status: 'Cancelled' },
        }),
      ]);

    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((acc, o) => acc + o.totalAmount, 0);

    return res.status(200).json({
      success: true,
      orders,
      stats: {
        totalOrders: total,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        processingOrders: processingCount,
        deliveredOrders: deliveredCount,
        cancelledOrders: cancelledCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.seller?.id;

    if (!id || !status) {
      return next(new ValidationError('Order ID and status are required'));
    }

    const validStatuses = [
      'Pending',
      'Processing',
      'Shipped',
      'Delivered',
      'Completed',
      'Cancelled',
      'Refunded',
    ];
    if (!validStatuses.includes(status)) {
      return next(
        new ValidationError(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        ),
      );
    }

    const order = await prisma.orders.findUnique({
      where: { id },
      include: { shop: true },
    });

    if (!order) {
      return next(new ValidationError('Order not found'));
    }

    if (sellerId && order.shop?.sellerId !== sellerId) {
      return next(
        new AuthError('Unauthorized: You can only update orders for your shop'),
      );
    }

    const updatedOrder = await prisma.orders.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'Delivered' ? { paymentStatus: 'Paid' } : {}),
      },
    });

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const sellerId = req.seller?.id;

    if (!id) {
      return next(new ValidationError('Order ID is required'));
    }

    const order = await prisma.orders.findUnique({
      where: { id },
      include: { shop: true },
    });

    if (!order) {
      return next(new ValidationError('Order not found'));
    }

    const isBuyer = userId && order.userId === userId;
    const isShopOwner = sellerId && order.shop?.sellerId === sellerId;

    if (!isBuyer && !isShopOwner) {
      return next(new AuthError('Unauthorized: Cannot cancel this order'));
    }

    if (order.status === 'Delivered' || order.status === 'Completed') {
      return next(
        new ValidationError(
          'Cannot cancel an order that has already been delivered',
        ),
      );
    }

    if (order.status === 'Cancelled') {
      return next(new ValidationError('Order is already cancelled'));
    }

    const items = (order.items as any[]) || [];
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const pId = item.productId || item.id;
        const qty = Number(item.quantity ?? 1);
        if (pId) {
          await tx.products.update({
            where: { id: pId },
            data: {
              stock: { increment: qty },
              totalSales: { decrement: qty },
            },
          });
        }
      }

      return await tx.orders.update({
        where: { id },
        data: {
          status: 'Cancelled',
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: cancelledOrder,
    });
  } catch (error) {
    return next(error);
  }
};
