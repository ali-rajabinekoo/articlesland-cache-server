export const rabbitmqUrl: string =
  process.env.AMQP_URL || 'amqp://localhost:5672';

export const databaseUrl: string =
  process.env.DATABASE_URL || 'mongodb://localhost/articlesLand';

export const draftQueueLimit: number = Number(process.env.DRAFT_LIMIT) || 3;
