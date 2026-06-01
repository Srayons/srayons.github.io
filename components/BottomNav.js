window.BottomNav = {
  props: ['activeTab'],
  emits: ['tab-change'],
  template: `
    <nav class="bottom-nav">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="nav-item"
        :class="{ active: activeTab === tab.key }"
        @click="$emit('tab-change', tab.key)"
      >
        <span class="nav-icon" v-html="tab.icon"></span>
        <span class="nav-label">{{ tab.label }}</span>
      </div>
    </nav>
  `,
  setup() {
    const tabs = [
      { key: 'sent',    label: '已发单', icon: '📤' },
      { key: 'settled', label: '已结单', icon: '✅' },
      { key: 'friends', label: '好友',   icon: '👥' },
      { key: 'me',      label: '我的',   icon: '👤' }
    ];
    return { tabs };
  }
};
