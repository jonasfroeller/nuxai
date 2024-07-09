import { DataSource } from 'typeorm'
import { User } from './entities/User'
const parse = require('pg-connection-string').parse; /* https://www.npmjs.com/package/pg-connection-string */

const dataSourceConfiguration = parse(process.env.DATABASE_CONNECTION_STRING || 'postgresql://localhost:5432/postgres');

const AppDataSource = new DataSource({
    type: 'postgres',
    synchronize: false,
    logging: false,
    host: dataSourceConfiguration.host,
    port: dataSourceConfiguration.port,
    username: dataSourceConfiguration.user,
    password: dataSourceConfiguration.password,
    database: dataSourceConfiguration.database,
    entities: [User],
    extra: {
        ssl: false
    }
})

const initialize = async () => {
    if (AppDataSource.isInitialized) {
        console.log('DB: Already initialized')
        return
    }

    try {
        await AppDataSource.initialize()
    } catch (error) {
        console.error('DB: Failed to initialized database')
        throw error
    }
}

export { AppDataSource, initialize }
