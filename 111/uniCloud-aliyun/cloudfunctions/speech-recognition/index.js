'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
    const { filePath } = event;

    try {
        // 使用uni-app的语音识别API
        const res = await uni.startRecord();
        console.log('录音开始');

        // 录音5秒
        await new Promise(resolve => setTimeout(resolve, 5000));

        const stopRes = await uni.stopRecord();
        console.log('录音结束', stopRes);

        // 使用uni-app的语音识别功能
        const recognizeRes = await uni.recognizeSpeech({
            filePath: stopRes.tempFilePath
        });

        // 获取识别结果
        const text = recognizeRes.result;

        // 解析语音识别结果
        const [name, quantity, expireDate] = text.split(' ');

        // 插入数据到数据库
        const dbRes = await db.collection('fridge_inventory').add({
            name,
            quantity: parseInt(quantity),
            expireDate,
            scanDate: new Date().toISOString().split('T')[0]
        });

        return {
            code: 0,
            msg: 'success',
            data: {
                text: text,
                dbResult: dbRes
            }
        };
    } catch (error) {
        console.error('语音识别失败:', error);
        return {
            code: -1,
            msg: '语音识别失败',
            data: error
        };
    }
}; 