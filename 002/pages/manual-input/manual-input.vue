<template>
	<view class="container">
		<view class="form-item">
			<text class="label">种类：</text>
			<input class="input" v-model="itemName" placeholder="请输入物品种类" />
		</view>
		<view class="form-item">
			<text class="label">扫描日期：</text>
			<input class="input" v-model="storageDate" placeholder="请输入扫描日期" />
		</view>
		<view class="form-item">
			<text class="label">保质期：</text>
			<input class="input" v-model="expireDate" placeholder="请输入保质期" />
		</view>
		<button class="submit-btn" @click="submitData">提交</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				itemName: '',
				storageDate: '',
				expireDate: ''
			}
		},
		methods: {
			async submitData() {
				try {
					const res = await uniCloud.callFunction({
						name: 'submit-data',
						data: {
							name: this.itemName,
							quantity: 1, // 默认数量为1
							expireDate: this.expireDate,
							scanDate: this.storageDate
						}
					});
					if (res.result.code === 0) {
						uni.showToast({
							title: '提交成功',
							icon: 'success'
						});
						// 清空输入框
						this.itemName = '';
						this.storageDate = '';
						this.expireDate = '';
					}
				} catch (error) {
					console.error('提交失败:', error);
					uni.showToast({
						title: '提交失败',
						icon: 'none'
					});
				}
			}
		}
	}
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

	.submit-btn {
		margin-top: 30px;
		background-color: #007aff;
		color: white;
		border-radius: 4px;
		padding: 10px;
		font-size: 16px;
	}
</style> 