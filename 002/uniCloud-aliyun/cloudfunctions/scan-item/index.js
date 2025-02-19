'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
    const { name, quantity, imageUrl } = event;

    // 获取当前日期
    const scanDate = new Date().toISOString().split('T')[0];

    // 插入数据到数据库
    const res = await db.collection('fridge_inventory').add({
        name,
        quantity,
        scanDate,
        imageUrl: imageUrl || '', // 保存图片 URL
        lastUpdated: 0
    });

    return {
        code: 0,
        msg: 'success',
        data: res
    };
}; 