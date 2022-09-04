import { Column, Entity } from "typeorm";
import { Model } from "../public/model";

@Entity()
export class Category extends Model {
  @Column({ type: "varchar", length: 20 })
  content!: string;
}
