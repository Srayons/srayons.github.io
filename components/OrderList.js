window.OrderList = {
  props: ['orders', 'status'],
  emits: ['settle', 'delete'],
  template: `
    <div class="order-list">
      <div v-if="orders.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>{{ status === 'sent' ? '暂无待结算订单' : '暂无已结订单' }}</p>
      </div>
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-info">
          <div class="order-title">{{ order.title }}</div>
          <div class="order-meta">
            <span class="order-friend">👤 {{ order.friend }}</span>
            <span class="order-date">{{ order.date }}</span>
          </div>
          <div v-if="order.status === 'settled'" class="order-pay-method">
            <span :class="order.payMethod === '微信' ? 'pay-wechat' : 'pay-alipay'">
              {{ order.payMethod === '微信' ? '💚' : '💙' }} {{ order.payMethod }}
            </span>
          </div>
        </div>
        <div class="order-actions">
          <span class="order-amount">¥{{ order.amount.toFixed(2) }}</span>
          <button
            v-if="status === 'sent'"
            class="btn-settle"
            @click="$emit('settle', order)"
          >去结算</button>
          <button
            v-else
            class="btn-done"
            disabled
          >已支付</button>
          <button class="btn-delete" @click="$emit('delete', order.id)">✕</button>
        </div>
      </div>
    </div>
  `
};
