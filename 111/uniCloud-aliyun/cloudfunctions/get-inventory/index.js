'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
    const res = await db.collection('fridge_inventory').get();

    return {
        code: 0,
        msg: 'success',
        data: res.data
    };
}; 