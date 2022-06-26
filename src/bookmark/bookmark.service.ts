import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {}

  async getBookmarks(userId: number) {
    return this.prismaService.bookmark.findMany({ where: { userId } });
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prismaService.bookmark.findFirst({
      where: { id: bookmarkId, userId },
    });

    if (!bookmark) {
      throw new NotFoundException({
        errorMsg: `Bookmark with ${bookmarkId} doesn't exist`,
      });
    }
    return bookmark;
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    editBookmarkDto: EditBookmarkDto,
  ) {
    return this.prismaService.bookmark.update({
      where: { uniqueBookmarkId: { id: bookmarkId, userId } },
      data: editBookmarkDto,
    });
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    return this.prismaService.bookmark.create({
      data: {
        userId,
        ...dto,
      },
      select: {
        user: { select: { firstName: true, lastName: true, email: true } },
        title: true,
        description: true,
        link: true,
        id: true,
      },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    return this.prismaService.bookmark.delete({
      where: { uniqueBookmarkId: { userId, id: bookmarkId } },
    });
  }
}
