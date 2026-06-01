window.FriendList = {
  props: ['friends'],
  emits: ['delete', 'add'],
  template: `
    <div class="friend-list">
      <div v-if="friends.length === 0" class="empty-state">
        <span class="empty-icon">👥</span>
        <p>暂无好友</p>
      </div>
      <div v-for="friend in friends" :key="friend.id" class="friend-card">
        <div class="friend-avatar">{{ friend.name[0] }}</div>
        <div class="friend-info">
          <div class="friend-name">{{ friend.name }}</div>
          <div class="friend-phone">{{ friend.phone }}</div>
        </div>
        <button class="btn-delete" @click="$emit('delete', friend.id)">✕</button>
      </div>

      <!-- 添加好友表单 -->
      <div class="add-form">
        <h4>添加好友</h4>
        <input v-model="newName" placeholder="好友姓名" class="form-input" />
        <input v-model="newPhone" placeholder="手机号" class="form-input" />
        <button class="btn-primary" @click="handleAdd">添加</button>
      </div>
    </div>
  `,
  setup(props, { emit }) {
    const newName = Vue.ref('');
    const newPhone = Vue.ref('');

    function handleAdd() {
      if (!newName.value.trim()) return;
      emit('add', { name: newName.value.trim(), phone: newPhone.value.trim() || '未填写' });
      newName.value = '';
      newPhone.value = '';
    }

    return { newName, newPhone, handleAdd };
  }
};
