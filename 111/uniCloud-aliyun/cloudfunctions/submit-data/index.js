'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
    // 获取传入的数据
    const { name, quantity, expireDate } = event;

    // 插入数据到数据库
    const res = await db.collection('fridge_inventory').add({
        name,
        quantity,
        expireDate
    });

    return {
        code: 0,
        msg: 'success',
        data: res
    };
}; 