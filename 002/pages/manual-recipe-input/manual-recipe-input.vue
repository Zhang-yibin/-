<template>
    <view class="container">
        <view class="form-item">
            <text class="label">菜谱名称：</text>
            <input class="input" v-model="name" placeholder="请输入菜谱名称" />
        </view>
        <view class="form-item">
            <text class="label">所需食材：</text>
            <input class="input" v-model="ingredients" placeholder="请输入食材，用逗号分隔" />
        </view>
        <view class="form-item">
            <text class="label">制作步骤：</text>
            <textarea class="input" v-model="steps" placeholder="请输入制作步骤" />
        </view>
        <view class="form-item">
            <text class="label">图片URL：</text>
            <input class="input" v-model="imageUrl" placeholder="请输入图片URL" />
        </view>
        <view class="form-item">
            <text class="label">禁忌人群：</text>
            <input class="input" v-model="warning" placeholder="请输入禁忌人群" />
        </view>
        <button class="submit-btn" @click="submitRecipe">提交</button>
        <button class="back-btn" @click="goBack">返回首页</button>
    </view>
</template>

<script>
export default {
    data() {
        return {
            name: '',
            ingredients: '',
            steps: '',
            imageUrl: '',
            warning: ''
        };
    },
    onLoad() {
        uni.setNavigationBarTitle({
            title: '手动录入菜谱'
        });
    },
    methods: {
        async submitRecipe() {
            // 表单验证
            if (!this.name) {
                uni.showToast({
                    title: '请输入菜谱名称',
                    icon: 'none'
                });
                return;
            }
            if (!this.ingredients) {
                uni.showToast({
                    title: '请输入所需食材',
                    icon: 'none'
                });
                return;
            }
            if (!this.steps) {
                uni.showToast({
                    title: '请输入制作步骤',
                    icon: 'none'
                });
                return;
            }

            try {
                // 显示加载状态
                uni.showLoading({
                    title: '提交中...'
                });

                // 调用云函数提交菜谱
                const res = await uniCloud.callFunction({
                    name: 'submit-recipe',
                    data: {
                        name: this.name,
                        ingredients: this.ingredients.split(','),
                        steps: this.steps,
                        imageUrl: this.imageUrl,
                        warning: this.warning
                    }
                });

                // 隐藏加载状态
                uni.hideLoading();

                if (res.result.code === 0) {
                    uni.showToast({
                        title: '提交成功',
                        icon: 'success'
                    });
                    // 清空输入框
                    this.name = '';
                    this.ingredients = '';
                    this.steps = '';
                    this.imageUrl = '';
                    this.warning = '';
                } else {
                    uni.showToast({
                        title: res.result.msg || '提交失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                console.error('提交失败:', error);
                uni.hideLoading();
                uni.showToast({
                    title: '提交失败，请检查网络连接',
                    icon: 'none'
                });
            }
        },
        goBack() {
            uni.navigateBack({
                delta: 1
            });
        }
    }
};
</script>

<style>
.container {
    padding: 20px;
}

.form-item {
    margin-bottom: 20px;
}

.label {
    font-size: 16px;
    color: #333;
    margin-bottom: 5px;
    display: block;
}

.input {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    font-size: 14px;
    width: 100%;
}

textarea.input {
    height: 100px;
}

.submit-btn {
    margin-top: 30px;
    background-color: #007aff;
    color: white;
    border-radius: 4px;
    padding: 10px;
    font-size: 16px;
}

.back-btn {
    margin-top: 15px;
    background-color: #666;
    color: white;
    border-radius: 4px;
    padding: 10px;
    font-size: 16px;
}
</style> 