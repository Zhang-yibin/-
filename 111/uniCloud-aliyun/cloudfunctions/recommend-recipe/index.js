'use strict';

exports.main = async (event, context) => {
    const { inventory } = event;

    // 这里可以根据库存推荐食谱
    const recipes = [
        {
            name: '牛奶鸡蛋布丁',
            ingredients: ['牛奶', '鸡蛋']
        },
        {
            name: '苹果派',
            ingredients: ['苹果', '面粉']
        }
    ];

    // 过滤出可以制作的食谱
    const availableRecipes = recipes.filter(recipe => {
        return recipe.ingredients.every(ingredient =>
            inventory.some(item => item.name === ingredient)
        );
    });

    return {
        code: 0,
        msg: 'success',
        data: availableRecipes
    };
}; 