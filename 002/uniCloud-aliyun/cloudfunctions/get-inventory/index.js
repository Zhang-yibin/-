'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
    try {
        const { itemName } = event;

        // 查询库存数据
        const query = itemName ? { name: itemName } : {};
        const res = await db.collection('fridge_inventory').where(query).get();

        return {
            code: 0,
            msg: 'success',
            data: res.data
        };
    } catch (error) {
        console.error('获取库存数据失败:', error);
        return {
            code: -1,
            msg: '获取库存数据失败',
            data: error
        };
    }
}; 