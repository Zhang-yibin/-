<template>
	<view class="container">
		<view class="header">
			<text class="title">查询结果</text>
		</view>
		<view class="inventory">
			<view class="inventory-item" v-if="inventory.length > 0">
				<text class="item-name">{{inventory[0].name}}</text>
				<text class="item-quantity">数量：{{inventory[0].quantity}}</text>
				<text class="item-expire">保质期：{{inventory[0].expireDate}}</text>
				<text class="item-date">扫描日期：{{inventory[0].scanDate}}</text>
			</view>
			<view v-else class="no-data">
				<text>未找到该物品</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				inventory: [],
				itemName: ''
			}
		},
		onLoad(options) {
			if (options.itemName) {
				this.itemName = options.itemName;
				this.getInventory();
			} else {
				uni.showToast({
					title: '未传入查询参数',
					icon: 'none'
				});
			}
		},
		methods: {
			async getInventory() {
				try {
					const res = await uniCloud.callFunction({
						name: 'get-inventory',
						data: {
							itemName: this.itemName
						}
					});
					if (res.result.code === 0) {
						this.inventory = res.result.data;
						if (this.inventory.length === 0) {
							uni.showToast({
								title: '未找到该物品',
								icon: 'none'
							});
						}
					} else {
						uni.showToast({
							title: '查询失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('获取库存失败:', error);
					uni.showToast({
						title: '获取库存失败',
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

	.header {
		margin-bottom: 20px;
	}

	.title {
		font-size: 24px;
		font-weight: bold;
		color: #333;
	}

	.inventory {
		width: 100%;
	}

	.inventory-item {
		background-color: #f8f8f8;
		padding: 15px;
		margin-bottom: 15px;
		border-radius: 8px;
	}

	.item-name {
		font-size: 18px;
		font-weight: bold;
		color: #333;
	}

	.item-quantity,
	.item-expire,
	.item-date {
		font-size: 14px;
		color: #666;
		margin-top: 5px;
	}

	.no-data {
		text-align: center;
		margin-top: 20px;
		color: #666;
	}
</style> 