const axios = require('axios');
const db = uniCloud.database();

exports.main = async (event, context) => {
    const { itemNames } = event;

    try {
        // 调用 Unsplash API 查询图片
        const imageUrls = await Promise.all(itemNames.map(async (name) => {
            const response = await axios.get('https://api.unsplash.com/search/photos', {
                params: {
                    query: name,
                    client_id: 'dtotKP_Yh0CDBntPswSwO4SRaTI9lte0ajmLHbB3TCc', // 你的 Unsplash Access Key
                    per_page: 1
                }
            });
            return response.data.results[0]?.urls?.small || ''; // 返回第一张图片的 URL
        }));

        // 将图片 URL 更新到库存数据库
        const collection = db.collection('fridge_inventory');
        const now = Date.now();

        await Promise.all(itemNames.map(async (name, index) => {
            const imageUrl = imageUrls[index];
            if (imageUrl) {
                try {
                    // 更新库存数据中的图片 URL
                    await collection.where({ name: name }).update({
                        imageUrl,
                        lastUpdated: now
                    });
                } catch (error) {
                    console.error('更新图片失败:', error);
                    uni.showToast({
                        title: `更新图片失败: ${name}`,
                        icon: 'none'
                    });
                    throw error;
                }
            }
        }));

        return {
            code: 0,
            msg: 'success',
            data: imageUrls
        };
    } catch (error) {
        console.error('查询图片失败:', error);
        uni.showToast({
            title: '查询图片失败',
            icon: 'none'
        });
        return {
            code: -1,
            msg: '查询图片失败',
            data: error
        };
    }
}; 