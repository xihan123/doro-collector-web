import { defineStore } from 'pinia';

type ThemeType = 'light' | 'dark';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light' as ThemeType
  }),

  getters: {
    isDark(): boolean {
      return this.theme === 'dark';
    }
  },

  actions: {
    setTheme(theme: ThemeType): void {
      this.theme = theme;
      // 修改 HTML 的 data-theme 属性来触发 Element Plus 主题切换
      document.documentElement.setAttribute('class', theme === 'dark' ? 'dark' : '');
      localStorage.setItem('theme', theme);
    },

    toggleTheme(): void {
      const newTheme = this.theme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
    },

    initTheme(): void {
      const savedTheme = localStorage.getItem('theme') as ThemeType | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      const theme = savedTheme || (prefersDark ? 'dark' : 'light');
      this.setTheme(theme);
    }
  }
});