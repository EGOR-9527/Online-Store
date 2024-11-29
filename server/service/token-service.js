require('dotenv').config();
const jwt = require('jsonwebtoken');
const {client, admin, vendor} = require("../model/base-model");


class TokenService {

    generateToken(payload) {
        try {
            if (!process.env.JWT_ACCESS_KEY || !process.env.JWT_REFRASH_KEY) {
                throw new Error('JWT secret keys are not defined');
            }
              
            const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY, { expiresIn: '15m' });
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRASH_KEY, { expiresIn: '7d' });
             
            return { accessToken, refreshToken };

        } catch (err) {
            console.error('Error generating tokens:', err);
            return null;
        }
    }

    async apdeateAccessToken(payload, refreshToken, status) {
        try {

            if(status === "client"){

                const user = await client.findOne({ where: { refresh_token: refreshToken } });
    
                if (!user) {
                    throw new Error('Токен не найден');
                }
        
                if (jwt.verify(refreshToken, process.env.JWT_REFRASH_KEY)) {
                    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY, { expiresIn: '15m' });
                    return { accessToken };
                } else {
                    throw new Error('Токен недействителен');
                }

            }

            if(status === "vendor"){

                const user = await vendor.findOne({ where: { refresh_token: refreshToken } });
    
                if (!user) {
                    throw new Error('Токен не найден');
                }
        
                if (jwt.verify(refreshToken, process.env.JWT_REFRASH_KEY)) {
                    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY, { expiresIn: '15m' });
                    return { accessToken };
                } else {
                    throw new Error('Токен недействителен');
                }

            }
    
        } catch (err) {
            console.error('Ошибка обновления токена:', err);
            return null;
        }
    }

    validateToken(tokenm, secretKey) {

        try {

            return jwt.verify(tokenm, secretKey)

        }catch(err){

            console.error('Ошибка валидации токена:', error);
            return null;

        }

    }

    async saveToken(email, refreshToken, status) {

        try {

            if(status === "client"){

                const tokenData = await client.findOne({where: {email: email}})

                console.log("tokenData: " + tokenData)

                if(tokenData) {
    
                    tokenData.refreshToken = refreshToken;
                    return await tokenData.save();
    
                }
    
                return await client.create({ email:email, refresh_token: refreshToken});

            }

            if(status === "vendor"){

                const tokenData = await vendor.findOne({where: {email: email}})

                if(tokenData) {
    
                    tokenData.refreshToken = refreshToken;
                    return await tokenData.save();
    
                }
    
                return await vendor.create({ email:email, refresh_token: refreshToken});


            }

        }catch(error){

            console.error('Ошибка сохранения токена:', error);
            return null;

        }

    }

    async removeToken(refreshToken, status) {

        try{

            if(status === "client"){

                if(!refreshToken) {
                    throw new Error('Не указан refreshToken');
                }
    
                const user = await client.findOne({where: {refresh_token:refreshToken}});
    
                if (user) {
                    user.refreshToken = null;
                    await user.save();
                    return 'Токен пользователя успешно удален';
                  } else {
                    return 'Пользователь с таким токеном не найден';
                  }

            }

            if(status === "vendor"){

                if(!refreshToken) {
                    throw new Error('Не указан refreshToken');
                }
    
                const user = await vendor.findOne({where: {refresh_token:refreshToken}});
    
                if (user) {
                    user.refreshToken = null;
                    await user.save();
                    return 'Токен пользователя успешно удален';
                  } else {
                    return 'Пользователь с таким токеном не найден';
                  }

            }

        }catch(error){

            console.error('Ошибка удаления токена пользователя:', error);
            throw error;

        }

    }

    async seurchUser(name, status) {

        try{

            if(status === "client"){

                const user = await client.getByName(name);

                return user

            }
    
            if(status === "vendor"){
    
                const user = await vendor.getByName(name);

                return user
                
            }
    

        }catch(error){

            console.error('Ошибка поиска пользователя:', error);
            throw error;

        }

    }

}

module.exports = new TokenService();