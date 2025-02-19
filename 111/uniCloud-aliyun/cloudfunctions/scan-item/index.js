'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
    const { name, quantity } = event;

    // 获取当前日期
    const scanDate = new Date().toISOString().split('T')[0];

    // 插入数据到数据库
    const res = await db.collection('fridge_inventory').add({
        name,
        quantity,
        scanDate
    });

    return {
        code: 0,
        msg: 'success',
        data: res
    };
}; 