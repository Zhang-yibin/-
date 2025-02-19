<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
		</view>
		<button class="social-btn" @click="navigateToDouyin">前往抖音</button>
		<button class="scan-btn" @click="scanItem">扫描物品</button>
		<view class="recipe-query-section">
			<input class="recipe-query-input" v-model="recipeQuery" placeholder="请输入食材" />
			<button class="recipe-query-btn" @click="recommendRecipe">推荐食谱</button>
		</view>
		<button class="voice-btn" @click="startVoiceInput">语音录入</button>
		
		<!-- 添加查询库存区域 -->
		<view class="query-section">
			<input class="query-input" v-model="queryItemName" placeholder="请输入要查询的物品种类" />
			<button class="query-btn" @click="queryInventory">查询</button>
		</view>

		<view class="inventory">
			<view class="inventory-item" v-for="(item, index) in inventory" :key="index">
				<image class="item-image" :src="item.imageUrl || '/static/default-image.png'" mode="aspectFill"></image>
				<text class="item-name">{{item.name}}</text>
				<text class="item-quantity">数量：{{item.quantity}}</text>
				<text class="item-expire">保质期：{{item.expireDate}}</text>
				<text class="item-date">扫描日期：{{item.scanDate}}</text>
			</view>
		</view>

		<view class="incompatibility-section">
			<text class="section-title">库存物品相克信息</text>
			<view class="incompatibility-item" v-for="(item, index) in incompatibilityList" :key="index">
				<text class="item-name">{{ item.name }}</text>
				<text class="incompatibility-info">{{ item.info }}</text>
			</view>
		</view>

		<view class="recipe-section">
			<text class="section-title">推荐食谱</text>
			<view class="recipe-item" v-for="(recipe, index) in recipes" :key="index">
				<image class="recipe-image" :src="recipe.image" mode="aspectFill"></image>
				<text class="recipe-name">{{recipe.name}}</text>
				<text class="recipe-ingredients">所需食材：{{recipe.ingredients.join('、')}}</text>
				<text class="recipe-steps">制作步骤：{{recipe.steps}}</text>
				<text class="recipe-warning">禁忌人群：{{recipe.warning}}</text>
			</view>
		</view>

		<view class="manual-input-section">
			<button class="manual-input-btn" @click="navigateToManualInput">手动录入</button>
		</view>

		<view class="manual-recipe-input-section">
			<button class="manual-recipe-input-btn" @click="navigateToManualRecipeInput">手动录入菜谱</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '智能冰箱库存',
				inventory: [],
				queryItemName: '',
				incompatibilityList: [], // 存储相克信息
				recipes: [], // 存储推荐的食谱
				recipeQuery: ''
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
			async getInventory() {
				try {
					const res = await uniCloud.callFunction({
						name: 'get-inventory'
					});

					if (res.result.code === 0) {
						this.inventory = res.result.data;
						this.getIncompatibilityInfo(); // 获取相克信息
						this.getImagesForInventory(); // 获取图片
						this.getRecipes(); // 获取推荐食谱
					} else {
						console.error('获取库存失败:', res.result.msg);
					}
				} catch (error) {
					console.error('获取库存失败:', error);
					uni.showToast({
						title: '获取库存失败',
						icon: 'none'
					});
				}
			},
			async getIncompatibilityInfo() {
				try {
					// 获取库存中所有物品的名称
					const itemNames = this.inventory.map(item => item.name);

					// 调用云函数查询相克信息
					const res = await uniCloud.callFunction({
						name: 'get-incompatibility-info',
						data: {
							itemNames: itemNames
						}
					});

					if (res.result.code === 0) {
						this.incompatibilityList = res.result.data;
					} else {
						console.error('获取相克信息失败:', res.result.msg);
					}
				} catch (error) {
					console.error('获取相克信息失败:', error);
				}
			},
			async getRecipes() {
				try {
					// 获取库存中所有物品的名称
					const itemNames = this.inventory.map(item => item.name);

					// 调用云函数查询食谱
					const res = await uniCloud.callFunction({
						name: 'recommend-recipe',
						data: {
							inventory: itemNames
						}
					});

					if (res.result.code === 0) {
						this.recipes = res.result.data;
					} else {
						console.error('获取食谱失败:', res.result.msg);
					}
				} catch (error) {
					console.error('获取食谱失败:', error);
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
				// 调用语音识别API
				// 使用uniCloud的语音识别功能
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
				// 假设语音为 "牛奶 3 2023-12-31"
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
			async queryInventory() {
				if (!this.queryItemName) {
					uni.showToast({
						title: '请输入要查询的物品种类',
						icon: 'none'
					});
					return;
				}

				try {
					// 显示加载状态
					uni.showLoading({
						title: '查询中...'
					});

					// 调用云函数查询库存
					const res = await uniCloud.callFunction({
						name: 'get-inventory',
						data: {
							itemName: this.queryItemName
						}
					});

					// 隐藏加载状态
					uni.hideLoading();

					if (res.result.code === 0) {
						this.inventory = res.result.data;
						if (this.inventory.length === 0) {
							uni.showToast({
								title: '未找到该物品',
								icon: 'none'
							});
						} else {
							// 显示查询结果
							const item = this.inventory[0]; // 获取第一个查询结果
							uni.showToast({
								title: `名称：${item.name}\n数量：${item.quantity}\n保质期：${item.expireDate}\n扫描日期：${item.scanDate}`,
								icon: 'none',
								duration: 3000 // 显示3秒
							});
						}
					} else {
						uni.showToast({
							title: '查询失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('查询失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: '查询失败',
						icon: 'none'
					});
				}
			},
			async getImagesForInventory() {
				try {
					// 获取库存中所有物品的名称
					const itemNames = this.inventory.map(item => item.name);

					// 检查哪些物品的图片需要更新
					const itemsToUpdate = itemNames.filter(name => {
						const item = this.inventory.find(i => i.name === name);
						return !item.imageUrl || Date.now() - item.lastUpdated > 7 * 24 * 60 * 60 * 1000; // 超过7天未更新
					});

					if (itemsToUpdate.length > 0) {
						// 调用云函数查询图片
						const res = await uniCloud.callFunction({
							name: 'get-item-images',
							data: {
								itemNames: itemsToUpdate
							}
						});

						if (res.result.code === 0) {
							// 更新 inventory 中的图片 URL
							this.inventory = this.inventory.map((item) => {
								const index = itemsToUpdate.indexOf(item.name);
								return {
									...item,
									imageUrl: index !== -1 ? res.result.data[index] : item.imageUrl
								};
							});
						} else {
							console.error('获取图片失败:', res.result.msg);
						}
					}
				} catch (error) {
					console.error('获取图片失败:', error);
				}
			},
			async scanItem() {
				try {
					// 调用摄像头扫描
					const res = await uni.chooseImage({
						count: 1, // 只选择一张图片
						sourceType: ['camera'], // 从摄像头获取
						sizeType: ['compressed'] // 压缩图片
					});

					if (res.tempFilePaths.length > 0) {
						const tempFilePath = res.tempFilePaths[0];

						// 上传图片到云端
						const uploadRes = await uniCloud.uploadFile({
							filePath: tempFilePath,
							cloudPath: `scanned-images/${Date.now()}.jpg` // 云端存储路径
						});

						if (uploadRes.fileID) {
							// 将图片 URL 保存到数据库
							const dbRes = await uniCloud.callFunction({
								name: 'scan-item',
								data: {
									imageUrl: uploadRes.fileID // 使用 fileID 作为图片 URL
								}
							});

							if (dbRes.result.code === 0) {
								uni.showToast({
									title: '扫描成功，图片已保存',
									icon: 'success'
								});
								this.getInventory(); // 刷新库存
							} else {
								uni.showToast({
									title: '保存图片失败',
									icon: 'none'
								});
							}
						} else {
							uni.showToast({
								title: '上传图片失败',
								icon: 'none'
							});
						}
					}
				} catch (error) {
					console.error('扫描失败:', error);
					uni.showToast({
						title: '扫描失败',
						icon: 'none'
					});
				}
			},
			navigateToManualInput() {
				uni.navigateTo({
					url: '/pages/manual-input/manual-input'
				});
			},
			async recommendRecipe() {
				// 1. 检查用户是否输入了食材
				if (!this.recipeQuery) {
					uni.showToast({
						title: '请输入食材',
						icon: 'none'
					});
					return;
				}

				try {
					// 显示加载状态
					uni.showLoading({
						title: '查询中...'
					});

					// 2. 调用云函数查询食谱
					const res = await uniCloud.callFunction({
						name: 'recommend-recipe',
						data: {
							inventory: [this.recipeQuery] // 将用户输入的食材作为查询条件
						}
					});

					// 隐藏加载状态
					uni.hideLoading();

					// 3. 检查云函数返回的结果
					if (res.result.code === 0) {
						if (res.result.data && res.result.data.length > 0) {
							// 成功获取到食谱
							this.recipes = res.result.data;
							uni.showToast({
								title: '推荐成功',
								icon: 'success'
							});
						} else {
							// 未找到相关食谱
							uni.showToast({
								title: '未找到相关食谱',
								icon: 'none'
							});
						}
					} else {
						// 云函数返回错误
						uni.showToast({
							title: res.result.msg || '推荐失败',
							icon: 'none'
						});
					}
				} catch (error) {
					// 4. 捕获异常并处理
					console.error('推荐失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: '推荐失败，请检查网络连接',
						icon: 'none'
					});
				}
			},
			navigateToManualRecipeInput() {
				uni.navigateTo({
					url: '/pages/manual-recipe-input/manual-recipe-input',
					success: () => {
						console.log('成功跳转到手动录入菜谱页面');
					},
					fail: (err) => {
						console.error('导航失败:', err);
						uni.showToast({
							title: '无法打开页面，请稍后重试',
							icon: 'none'
						});
					}
				});
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

	.recipe-query-section {
		margin-top: 40rpx;
		width: 90%;
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.recipe-query-input {
		flex: 1;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 8px;
		font-size: 14px;
	}

	.recipe-query-btn {
		width: 100rpx;
		background-color: #4CAF50;
		color: white;
		border-radius: 4px;
		padding: 8px;
		font-size: 14px;
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

	.item-image {
		width: 100%;
		height: 200rpx;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
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

	.query-section {
		margin-top: 40rpx;
		width: 90%;
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.query-input {
		flex: 1;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 8px;
		font-size: 14px;
	}

	.query-btn {
		width: 100rpx;
		background-color: #673AB7;
		color: white;
		border-radius: 4px;
		padding: 8px;
		font-size: 14px;
	}

	.incompatibility-section {
		margin-top: 40rpx;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 10rpx;
		width: 90%;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}

	.incompatibility-item {
		margin-bottom: 20rpx;
	}

	.item-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.incompatibility-info {
		font-size: 24rpx;
		color: #666;
		margin-top: 5rpx;
		display: block;
	}

	.recipe-section {
		margin-top: 40rpx;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 10rpx;
		width: 90%;
	}

	.recipe-item {
		margin-bottom: 20rpx;
	}

	.recipe-image {
		width: 100%;
		height: 200rpx;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
	}

	.recipe-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.recipe-ingredients {
		font-size: 28rpx;
		color: #666;
		margin-top: 10rpx;
	}

	.recipe-steps {
		font-size: 24rpx;
		color: #666;
		margin-top: 10rpx;
	}

	.recipe-warning {
		font-size: 24rpx;
		color: #ff0000;
		margin-top: 10rpx;
	}

	.manual-input-section {
		margin-top: 40rpx;
		padding: 20rpx;
		width: 90%;
		display: flex;
		justify-content: center;
	}

	.manual-input-btn {
		width: 200rpx;
		background-color: #4CAF50;
		color: white;
		border-radius: 10rpx;
		padding: 10rpx;
		font-size: 28rpx;
	}

	.manual-recipe-input-section {
		margin-top: 40rpx;
		padding: 20rpx;
		width: 90%;
		display: flex;
		justify-content: center;
	}

	.manual-recipe-input-btn {
		width: 200rpx;
		background-color: #673AB7;
		color: white;
		border-radius: 10rpx;
		padding: 10rpx;
		font-size: 28rpx;
	}
</style>
