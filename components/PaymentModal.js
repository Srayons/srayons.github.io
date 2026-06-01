window.PaymentModal = {
  props: ['visible', 'order'],
  emits: ['pay', 'close'],
  template: `
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <h3>选择支付方式</h3>
        <p class="modal-order-info" v-if="order">
          订单：{{ order.title }}<br>
          金额：<strong>¥{{ order.amount.toFixed(2) }}</strong>
        </p>
        <div class="pay-options">
          <div class="pay-option pay-wechat" @click="$emit('pay', '微信')">
            <span class="pay-icon">💚</span>
            <span class="pay-name">微信支付</span>
          </div>
          <div class="pay-option pay-alipay" @click="$emit('pay', '支付宝')">
            <span class="pay-icon">💙</span>
            <span class="pay-name">支付宝</span>
          </div>
        </div>
        <button class="btn-cancel" @click="$emit('close')">取消</button>
      </div>
    </div>
  `
};
