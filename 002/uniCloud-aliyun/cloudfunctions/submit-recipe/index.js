'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
    const { name, ingredients, steps, imageUrl, warning } = event;

    try {
        // 插入数据到数据库
        const res = await db.collection('recipes').add({
            name,
            ingredients,
            steps,
            imageUrl: imageUrl || '',
            warning: warning || '无禁忌人群',
            createdAt: Date.now()
        });

        return {
            code: 0,
            msg: 'success',
            data: res
        };
    } catch (error) {
        console.error('提交菜谱失败:', error);
        return {
            code: -1,
            msg: '提交菜谱失败',
            data: error
        };
    }
}; 