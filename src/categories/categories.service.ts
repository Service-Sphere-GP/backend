import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private model: Model<Category>) {}

  async create(name: string): Promise<Category> {
    return new this.model({ name }).save();
  }

  async findAll(): Promise<Category[]> {
    return this.model.find().exec();
  }

  async update(id: string, name: string): Promise<Category> {
    const updated = await this.model
      .findByIdAndUpdate(id, { name }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Category ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Category ${id} not found`);
  }
}
