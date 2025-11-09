/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ダンドリワーク ブランドカラー
        'dw-blue': {
          DEFAULT: '#0078C8',
          hover: '#0066AA',
          active: '#005FDB',
          title: '#004878',
        },
        // ボタン
        'button': {
          primary: '#0078C8',
          'primary-hover': '#0066AA',
          disable: '#BBBCBE',
          secondary: '#FFFFFF',
          'secondary-hover': '#EDF6FB',
          'secondary-frame': '#A4A6A8',
          'secondary-frame-hover': '#EFEFF0',
          error: '#DC1D1D',
          'error-hover': '#B01717',
          'text-button-hover': '#FDEFEF',
        },
        // テキスト
        'text': {
          primary: '#1C2026',
          sub: '#494D51',
          disable: '#8D8F92',
          placeholder: '#A4A6A8',
          white: '#FFFFFF',
          active: '#0066AA',
          title: '#004878',
          error: '#C61A1A',
        },
        // アイコン
        'icon': {
          primary: '#0078C8',
          disable: '#BBBCBE',
          error: '#DC1D1D',
          basic: '#BBBCBE',
          sub: '#828488',
          white: '#FFFFFF',
        },
        // 背景
        'bg': {
          white: '#FFFFFF',
          light: '#F6F6F6',
          soft: '#EFEFF0',
          medium: '#E4E4E5',
          dark: '#606367',
          selected: '#D9EBF7',
          error: '#FFFFFF',
          warning: '#F6F6F6',
          success: '#EFEFF0',
          active: '#E5F0FE',
        },
        // ライン
        'line': {
          light: '#E5F0FE',
          dark: '#A4A6A8',
          separator: '#E4E4E5',
          black: '#1C2026',
          focused: '#0078C8',
          error: '#DC1D1D',
          success: '#009F77',
          active: '#005FDB',
        },
        // ラベル
        'label': {
          '01': '#F7DE6E',
          '02': '#95CCC5',
          '03': '#C1E6EF',
          '04': '#B9CED6',
          '05': '#FFCA98',
          '06': '#BEE185',
          '07': '#C1E6EF',
          '08': '#F8ABB0',
        },
        // アクセントカラー
        'accent': {
          primary: '#0078C8',
          hover: '#0066AA',
        },
      },
    },
  },
  plugins: [],
}
