<template>
  <view class="verify-code" @click="refreshCode">
    <canvas canvas-id="codeCanvas" :style="{width: width + 'px', height: height + 'px'}"></canvas>
  </view>
</template>

<script>
export default {
  name: 'VerifyCode',
  props: {
    width: {
      type: Number,
      default: 120
    },
    height: {
      type: Number,
      default: 40
    },
    length: {
      type: Number,
      default: 4
    }
  },
  data() {
    return {
      code: ''
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.drawCode();
    });
  },
  methods: {
    // 随机生成颜色
    randomColor() {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r},${g},${b})`;
    },

    // 随机生成字符
    randomChar() {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return chars.charAt(Math.floor(Math.random() * chars.length));
    },

    // 绘制验证码
    drawCode() {
      const ctx = uni.createCanvasContext('codeCanvas', this);

      // 清空画布
      ctx.clearRect(0, 0, this.width, this.height);

      // 绘制背景
      ctx.setFillStyle('#f7f7f7');
      ctx.fillRect(0, 0, this.width, this.height);

      // 生成验证码字符
      let code = '';
      for (let i = 0; i < this.length; i++) {
        const char = this.randomChar();
        code += char;

        // 设置字体
        ctx.setFontSize(this.height * 0.6);
        ctx.setTextBaseline('middle');
        ctx.setFillStyle(this.randomColor());

        // 在uni-app中，不能直接使用rotate，需要使用transform
        const x = (i + 0.5) * (this.width / this.length);
        const y = this.height / 2;
        const deg = Math.random() * 30 * Math.PI / 180 * (Math.random() > 0.5 ? 1 : -1);

        // 保存当前状态
        ctx.save();
        // 移动到字符位置
        ctx.translate(x, y);
        // 旋转
        ctx.rotate(deg);
        // 绘制文字，uni-app的fillText参数顺序是(text, x, y)
        ctx.fillText(char, -ctx.measureText(char).width / 2, 0);
        // 恢复到保存的状态
        ctx.restore();
      }

      // 绘制干扰线
      for (let i = 0; i < 3; i++) {
        ctx.setStrokeStyle(this.randomColor());
        ctx.beginPath();
        ctx.moveTo(Math.random() * this.width, Math.random() * this.height);
        ctx.lineTo(Math.random() * this.width, Math.random() * this.height);
        ctx.stroke();
      }

      // 绘制干扰点
      for (let i = 0; i < 20; i++) {
        ctx.setFillStyle(this.randomColor());
        ctx.beginPath();
        ctx.arc(Math.random() * this.width, Math.random() * this.height, 1, 0, 2 * Math.PI);
        ctx.fill();
      }

      // 执行绘制
      ctx.draw(false, () => {
        this.code = code.toLowerCase();
        this.$emit('update:code', this.code);
      });
    },

    // 刷新验证码
    refreshCode() {
      this.drawCode();
    },

    // 验证
    verify(code) {
      return code.toLowerCase() === this.code;
    }
  }
};
</script>

<style scoped lang="scss">
.verify-code {
  cursor: pointer;
  display: inline-block;
  border-radius: 4px;
  overflow: hidden;
}
</style>