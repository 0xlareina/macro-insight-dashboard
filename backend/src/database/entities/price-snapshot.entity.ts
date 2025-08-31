import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('price_snapshots')
@Index(['symbol', 'timestamp'])
export class PriceSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  @Index()
  symbol: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  change24h: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  volume24h: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  high24h: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  low24h: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  marketCap: number;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: any;

  @CreateDateColumn()
  @Index()
  timestamp: Date;
}