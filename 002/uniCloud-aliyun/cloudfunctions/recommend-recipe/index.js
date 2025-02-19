'use strict';

const axios = require('axios');

exports.main = async (event, context) => {
    const { inventory } = event;

    try {
        // 调用 TheMealDB API 查询食谱
        const response = await axios.get('https://www.themealdb.com/api/json/v1/1/filter.php', {
            params: {
                i: inventory.join(',') // 库存中的物品
            }
        });

        // 获取食谱的详细信息
        const recipes = await Promise.all(response.data.meals.map(async (meal) => {
            const detailResponse = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php`, {
                params: {
                    i: meal.idMeal // 食谱 ID
                }
            });

            const mealDetails = detailResponse.data.meals[0];

            return {
                name: mealDetails.strMeal,
                image: mealDetails.strMealThumb,
                ingredients: Object.keys(mealDetails)
                    .filter(key => key.startsWith('strIngredient') && mealDetails[key])
                    .map(key => mealDetails[key]),
                steps: mealDetails.strInstructions || '暂无步骤',
                warning: '无禁忌人群' // TheMealDB 不提供禁忌人群信息
            };
        }));

        return {
            code: 0,
            msg: 'success',
            data: recipes
        };
    } catch (error) {
        console.error('查询食谱失败:', error);
        return {
            code: -1,
            msg: '查询食谱失败',
            data: error
        };
    }
}; 