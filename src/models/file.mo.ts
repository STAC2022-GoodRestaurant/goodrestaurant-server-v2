import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Model } from "../public/model";

@Entity()
export class File extends Model {
  @Column({ type: "varchar", length: 60 })
  filename!: string;

  @Column({ type: "varchar", length: 60 })
  path!: string;

  @Column({ type: "varchar", default: "image" })
  type?: string;
}
