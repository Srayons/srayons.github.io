const {createApp,reactive,ref,computed }=Vue;const app =createApp({template:`
    <div class="app-container">
      <header class="top-bar">
        <h1>{{ pageTitle }}</h1>
      </header>

      <main class="page-content">
        <!-- 已发单 -->
        <div v-if="activeTab === 'sent'">
          <div class="tab-header">
            <span>待结算订单 ({{ sentOrders.length }})</span>
            <button class="btn-add" @click="showAddOrder = true">+ 新建</button>
          </div>
          <order-list
            :orders="sentOrders"
            status="sent"
            @settle="openPayment"
            @delete="deleteOrder"
          />
        </div>

        <!-- 已结单 -->
        <div v-if="activeTab === 'settled'">
          <div class="tab-header">
            <span>已完成订单 ({{ settledOrders.length }})</span>
          </div>
          <order-list
            :orders="settledOrders"
            status="settled"
            @delete="deleteOrder"
          />
        </div>

        <!-- 好友列表 -->
        <div v-if="activeTab === 'friends'">
          <friend-list
            :friends="friends"
            @add="addFriend"
            @delete="deleteFriend"
          />
        </div>

        <!-- 我的 -->
        <div v-if="activeTab === 'me'">
          <div class="profile-card">
            <div class="profile-avatar">🧑</div>
            <div class="profile-name">用户</div>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-num">{{ sentOrders.length }}</span>
              <span class="stat-label">待结算</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ settledOrders.length }}</span>
              <span class="stat-label">已完成</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ friends.length }}</span>
              <span class="stat-label">好友数</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">¥{{ totalSettled }}</span>
              <span class="stat-label">总金额</span>
            </div>
          </div>
        </div>
      </main>

      <bottom-nav
        :activeTab="activeTab"
        @tab-change="switchTab"
      />

      <payment-modal
        :visible="showPayment"
        :order="payingOrder"
        @pay="handlePay"
        @close="showPayment = false"
      />

      <!-- 新建订单弹窗 -->
      <div v-if="showAddOrder" class="modal-overlay" @click.self="showAddOrder = false">
        <div class="modal-card">
          <h3>新建订单</h3>
          <input v-model="newOrderTitle" placeholder="订单名称" class="form-input" />
          <input v-model="newOrderAmount" placeholder="金额" type="number" class="form-input" />
          <select v-model="newOrderFriend" class="form-input">
            <option value="">选择好友</option>
            <option v-for="f in friends" :key="f.id" :value="f.name">{{ f.name }}</option>
          </select>
          <div class="modal-btns">
            <button class="btn-cancel" @click="showAddOrder = false">取消</button>
            <button class="btn-primary" @click="addOrder">确认</button>
          </div>
        </div>
      </div>
    </div>
  `,setup(){const titles ={sent:'已发单',settled:'已结单',friends:'好友列表',me:'我的'};const activeTab =ref('sent');const showPayment =ref(false);const payingOrder =ref(null);const showAddOrder =ref(false);const newOrderTitle =ref('');const newOrderAmount =ref('');const newOrderFriend =ref('');const orders =reactive([{id:1,title:'午餐AA',amount:35.50,status:'sent',friend:'张三',payMethod:null,date:'2025-01-15'},{id:2,title:'电影票',amount:60.00,status:'sent',friend:'李四',payMethod:null,date:'2025-01-14'},{id:3,title:'聚餐分摊',amount:128.00,status:'settled',friend:'王五',payMethod:'微信',date:'2025-01-13'},{id:4,title:'奶茶拼单',amount:18.00,status:'settled',friend:'张三',payMethod:'支付宝',date:'2025-01-12'},{id:5,title:'打车费',amount:42.00,status:'sent',friend:'王五',payMethod:null,date:'2025-01-16'}]);const friends =reactive([{id:1,name:'张三',phone:'138****1234'},{id:2,name:'李四',phone:'139****5678'},{id:3,name:'王五',phone:'136****9012'}]);const pageTitle =computed(()=>titles[activeTab.value]);const sentOrders =computed(()=>orders.filter(o =>o.status ==='sent'));const settledOrders =computed(()=>orders.filter(o =>o.status ==='settled'));const totalSettled =computed(()=>settledOrders.value.reduce((sum,o)=>sum +o.amount,0).toFixed(2));let nextOrderId =6;let nextFriendId =4;function switchTab(key){activeTab.value =key;}function openPayment(order){payingOrder.value =order;showPayment.value =true;}function handlePay(method){const idx =orders.findIndex(o =>o.id ===payingOrder.value.id);if (idx !==-1){orders[idx].status ='settled';orders[idx].payMethod =method;}showPayment.value =false;payingOrder.value =null;}function deleteOrder(id){const idx =orders.findIndex(o =>o.id ===id);if (idx !==-1){orders.splice(idx,1);}}function addOrder(){if (!newOrderTitle.value.trim()||!newOrderAmount.value ||!newOrderFriend.value)return;orders.push({id:nextOrderId++,title:newOrderTitle.value.trim(),amount:parseFloat(newOrderAmount.value),status:'sent',friend:newOrderFriend.value,payMethod:null,date:new Date().toISOString().slice(0,10)});newOrderTitle.value ='';newOrderAmount.value ='';newOrderFriend.value ='';showAddOrder.value =false;}function addFriend({name,phone }){friends.push({id:nextFriendId++,name,phone });}function deleteFriend(id){const idx =friends.findIndex(f =>f.id ===id);if (idx !==-1){friends.splice(idx,1);}}return {activeTab,pageTitle,sentOrders,settledOrders,totalSettled,friends,showPayment,payingOrder,showAddOrder,newOrderTitle,newOrderAmount,newOrderFriend,switchTab,openPayment,handlePay,deleteOrder,addOrder,addFriend,deleteFriend };}});app.component('bottom-nav',window.BottomNav);app.component('order-list',window.OrderList);app.component('friend-list',window.FriendList);app.component('payment-modal',window.PaymentModal);app.mount('#app');