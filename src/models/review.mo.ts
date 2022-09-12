import { Column, Entity, ManyToOne } from "typeorm";
import { Model } from "../public/model";
import { Restaurant } from "./restaurant.mo";
import { UserModel } from "./user.mo";

@Entity()
export class Review extends Model {
  @Column({ type: "varchar" })
  content!: string;

  @Column({ type: "int" })
  rating!: number;

  @Column({ type: "varchar", nullable: true })
  imageUrl?: string;

  @ManyToOne(() => UserModel)
  writer!: UserModel;

  @ManyToOne(() => Restaurant)
  restaurant!: Restaurant;
}
