import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateEstoqueDto } from './dto/create-estoque.dto';
import { EstoqueService } from './estoque.service';
import { UpdateEstoqueDto } from './dto/update-estoque.dto';

@Controller('estoque')
export class EstoqueController {
  constructor(private readonly estoqueService: EstoqueService) {}

  @Post()
  create(@Body() createEstoqueDto: CreateEstoqueDto) {
    return this.estoqueService.create(createEstoqueDto);
  }

  @Get()
  findAll() {
    return this.estoqueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estoqueService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstoqueDto: UpdateEstoqueDto) {
    return this.estoqueService.update(id, updateEstoqueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estoqueService.remove(id);
  }
}
