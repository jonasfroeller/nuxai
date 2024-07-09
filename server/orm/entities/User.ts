import { Column, Entity } from 'typeorm'
import { Base } from './Base'

@Entity()
export class User extends Base {
    @Column('text')
    email!: string
}
