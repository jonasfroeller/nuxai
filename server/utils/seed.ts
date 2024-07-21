import {
  chat_user,
  chat_user_oauth_account,
  chat_conversation,
  chat_conversation_message /* , POSSIBLE_OAUTH_PROVIDERS */,
} from '../database/schema';

// const enums = [POSSIBLE_OAUTH_PROVIDERS]
const tables = [
  chat_user,
  chat_user_oauth_account,
  chat_conversation,
  chat_conversation_message,
];
async function seedDatabase() {
  const instance = db;
  if (!instance) return;

  if (IS_DEV) console.info('Deleting tables...');
  for (let i = 0; i < tables.length; i++) {
    await instance
      .delete(tables[i])
      .then(() => {
        if (IS_DEV)
          console.info(`Deleted table ${tables[i].id.table._.name}...`);
      })
      .catch((e) => {
        if (IS_DEV) console.error('Failed to delete table. Cause:', e);
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          message: 'Failed to clear database',
        });
      });
  }

  if (IS_DEV) console.info('Seeding database...');

  await instance
    .insert(chat_user)
    .values([]) // TODO
    .then(() => {
      if (IS_DEV) console.info('Seeded database...');
    })
    .catch((e) => {
      if (IS_DEV) console.error('Failed to seed database:', e);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to seed database',
      });
    });
}

export default seedDatabase;

(async () => {
  // for package.json script
  await seedDatabase();
})();
