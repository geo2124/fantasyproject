import Redis from "ioredis";
import { EventEmitter } from "events";

const isRedisUrl = process.env.REDIS_URL;

class LocalPubSub {
  private emitter = new EventEmitter();

  async publish(channel: string, message: string) {
    this.emitter.emit(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void) {
    this.emitter.on(channel, callback);
  }
}

export const pubsub = isRedisUrl ? {
  publisher: new Redis(process.env.REDIS_URL!),
  subscriber: new Redis(process.env.REDIS_URL!),
  async publish(channel: string, message: string) {
    return this.publisher.publish(channel, message);
  },
  async subscribe(channel: string, callback: (message: string) => void) {
    this.subscriber.subscribe(channel);
    this.subscriber.on('message', (chan, msg) => {
       if (chan === channel) callback(msg);
    });
  }
} : new LocalPubSub();
