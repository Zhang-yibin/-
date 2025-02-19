<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
		</view>
		<button class="social-btn" @click="navigateToDouyin">前往抖音</button>
		<button class="scan-btn" @click="scanItem">扫描物品</button>
		<button class="recipe-btn" @click="recommendRecipe">推荐食谱</button>
		<button class="voice-btn" @click="startVoiceInput">语音录入</button>
		
		<!-- 添加手动录入入口 -->
		<view class="manual-input-section">
			<text class="section-title">手动录入</text>
			<view class="input-fields">
				<input class="input" v-model="manualItemName" placeholder="种类" />
				<input class="input" v-model="manualStorageDate" placeholder="存放时间" />
				<input class="input" v-model="manualExpireDate" placeholder="保质期" />
				<button class="submit-btn" @click="submitManualData">提交</button>
			</view>
		</view>

		<view class="inventory">
			<view class="inventory-item" v-for="(item, index) in inventory" :key="index">
				<text class="item-name">{{item.name}}</text>
				<text class="item-quantity">数量：{{item.quantity}}</text>
				<text class="item-expire">保质期：{{item.expireDate}}</text>
				<text class="item-date">扫描日期：{{item.scanDate}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '智能冰箱库存',
				
				inventory: [

					{

						name: '牛奶',

						quantity: 11,

						expireDate: '11'

					},

					{

						name: '鸡蛋',

						quantity: 111,

						expireDate: '2011'

					},

					{

						name: '苹果',

						quantity: 1111,

						expireDate: '20111'

					}

				],
				// 添加手动录入数据
				manualItemName: '',
				manualStorageDate: '',
				manualExpireDate: ''
			}
		},

		onLoad() {
			this.getInventory();
		},
		methods: {
			navigateToDouyin() {
				window.location.href = 'https://www.douyin.com';
			},
			async submitData() {
				try {
					const res = await uniCloud.callFunction({
						name: 'submit-data',
						data: {
							name: '牛奶',
							quantity: 3,
							expireDate: '2023-12-31'
						}
					});
					if (res.result.code === 0) {
						uni.showToast({
							title: '数据提交成功',
							icon: 'success'
						});
					}
				} catch (error) {
					console.error('数据提交失败:', error);
				}
			},
			// async scanItem() {
			// 	try {
			// 		// 调用摄像头扫描
			// 		const res = await uni.scanCode({
			// 			onlyFromCamera: true,
			// 			scanType: ['qrCode', 'barCode']
			// 		});
					
			// 		// 假设扫描结果包含物品名称和数量
			// 		const itemInfo = this.parseScanResult(res.result);
					
			// 		// 调用云函数保存数据
			// 		const cloudRes = await uniCloud.callFunction({
			// 			name: 'scan-item',
			// 			data: {
			// 				name: itemInfo.name,
			// 				quantity: itemInfo.quantity
			// 			}
			// 		});
					
			// 		if (cloudRes.result.code === 0) {
			// 			uni.showToast({
			// 				title: '扫描成功',
			// 				icon: 'success'
			// 			});
			// 			this.getInventory();
			// 		}
			// 	} catch (error) {
			// 		console.error('扫描失败:', error);
			// 		uni.showToast({
			// 			title: '扫描失败',
			// 			icon: 'none'
			// 		});
			// 	}
			// },这部分扫描逻辑得重写 包括下面的函数
			
			// parseScanResult(result) {
			// 	// 这里根据实际扫描结果解析物品信息
			// 	// 示例：假设扫描结果为 "牛奶:3"
			// 	const [name, quantity] = result.split(':');
			// 	return {
			// 		name,
			// 		quantity: parseInt(quantity)
			// 	};
			// },
			async getInventory() {
				try {
					const res = await uniCloud.callFunction({
						name: 'get-inventory'
					});
					if (res.result.code === 0) {
						this.inventory = res.result.data;
					}
				} catch (error) {
					console.error('获取库存失败:', error);
				}
			},
			async recommendRecipe() {
				try {
					const res = await uniCloud.callFunction({
						name: 'recommend-recipe',
						data: {
							inventory: this.inventory
						}
					});
					//云函数之推荐食谱 得写 目前无具体逻辑
					if (res.result.code === 0) {
						uni.showToast({
							title: '推荐成功',
							icon: 'success'
						});
						console.log('推荐食谱:', res.result.data);
					}
				} catch (error) {
					console.error('推荐失败:', error);
					uni.showToast({
						title: '推荐失败',
						icon: 'none'
					});
				}
			},
			async startVoiceInput() {
				try {
					const res = await uni.startRecord();
					console.log('录音开始');
					setTimeout(async () => {
						const res = await uni.stopRecord();
						console.log('录音结束', res);
						const text = await this.recognizeSpeech(res.tempFilePath);
						const itemInfo = this.parseVoiceInput(text);
						await this.submitVoiceData(itemInfo);
					}, 5000); // 录音5秒
				} catch (error) {
					console.error('录音失败:', error);
					uni.showToast({
						title: '录音失败',
						icon: 'none'
					});
				}
			},
			async recognizeSpeech(filePath) {
				// 这里调用语音识别API
				// 示例：使用uniCloud的语音识别功能
				const res = await uniCloud.callFunction({
					name: 'speech-recognition',
					data: {
						filePath: filePath
					}
				});
				return res.result.text;
			},
			parseVoiceInput(text) {
				// 解析语音识别结果
				// 示例：假设语音识别结果为 "牛奶 3 2023-12-31"
				const [name, quantity, expireDate] = text.split(' ');
				return {
					name: name,
					quantity: parseInt(quantity),
					expireDate: expireDate
				};
			},
			async submitVoiceData(itemInfo) {
				try {
					const res = await uniCloud.callFunction({
						name: 'submit-data',
						data: itemInfo
					});
					if (res.result.code === 0) {
						uni.showToast({
							title: '语音录入成功',
							icon: 'success'
						});
						this.getInventory();
					}
				} catch (error) {
					console.error('语音录入失败:', error);
					uni.showToast({
						title: '语音录入失败',
						icon: 'none'
					});
				}
			},
			// 添加手动录入方法
			async submitManualData() {
				try {
					const res = await uniCloud.callFunction({
						name: 'submit-data',
						data: {
							name: this.manualItemName,
							quantity: 1, // 默认数量为1
							expireDate: this.manualExpireDate,
							scanDate: this.manualStorageDate
						}
					});
					if (res.result.code === 0) {
						uni.showToast({
							title: '提交成功',
							icon: 'success'
						});
						// 清空输入框
						this.manualItemName = '';
						this.manualStorageDate = '';
						this.manualExpireDate = '';
						// 刷新库存
						this.getInventory();
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
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}

	.social-btn {
		margin-top: 40rpx;
		width: 200rpx;
		background-color: #ff0050;
		color: white;
		border-radius: 10rpx;
	}

	.scan-btn {
		margin-top: 40rpx;
		width: 200rpx;
		background-color: #007aff;
		color: white;
		border-radius: 10rpx;
	}

	.recipe-btn {
		margin-top: 40rpx;
		width: 200rpx;
		background-color: #4CAF50;
		color: white;
		border-radius: 10rpx;
	}

	.voice-btn {
		margin-top: 40rpx;
		width: 200rpx;
		background-color: #FF9800;
		color: white;
		border-radius: 10rpx;
	}

	.inventory {
		width: 90%;
		margin-top: 40rpx;
	}

	.inventory-item {
		background-color: #f8f8f8;
		padding: 20rpx;
		margin-bottom: 20rpx;
		border-radius: 10rpx;
		display: flex;
		flex-direction: column;
	}

	.item-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.item-quantity,
	.item-expire,
	.item-date {
		font-size: 28rpx;
		color: #666;
		margin-top: 10rpx;
	}

	/* 添加手动录入区域样式 */
	.manual-input-section {
		margin-top: 40rpx;
		width: 90%;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 10rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}

	.input-fields {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.input {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 8px;
		font-size: 14px;
		width: 100%;
	}

	.submit-btn {
		margin-top: 20rpx;
		background-color: #007aff;
		color: white;
		border-radius: 4px;
		padding: 10px;
		font-size: 16px;
	}
</style>
