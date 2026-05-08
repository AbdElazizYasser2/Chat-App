import redisClient from "../config/redis.js";

const DEFAULT_TTL = 60 * 60; 

export const getCache = async (key) => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  await redisClient.setEx(key, ttl, JSON.stringify(value));
};

export const deleteCache = async (key) => {
  await redisClient.del(key);
};

export const deletePattern = async (pattern) => {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) await redisClient.del(keys);
};