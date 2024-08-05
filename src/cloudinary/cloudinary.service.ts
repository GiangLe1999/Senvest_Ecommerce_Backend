import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('Cloudinary') private readonly cloudinary,
    private readonly config: ConfigService,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: this.config.get('CLOUDINARY_FOLDER') },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
  ): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  async uploadVideo(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // specify the resource type as video
          folder: this.config.get('CLOUDINARY_FOLDER'),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  async uploadVideos(
    files: Express.Multer.File[],
  ): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    const uploadPromises = files.map((file) => this.uploadVideo(file));
    return Promise.all(uploadPromises);
  }

  extractPublicId(imageUrl: string) {
    const parts = imageUrl.split('/');
    const folderName = parts[parts.length - 2];
    const filename = parts[parts.length - 1];
    const [publicId] = filename.split('.');
    return `${folderName}/${publicId}`;
  }

  async deleteImage(secureUrl: string): Promise<{ result: string }> {
    try {
      const publicId = this.extractPublicId(secureUrl);
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: 'Xóa ảnh không thành công',
      });
    }
  }

  async deleteImages(secureUrls: string[]): Promise<{ result: string }[]> {
    try {
      const deletePromises = secureUrls.map(async (secureUrl) => {
        const publicId = this.extractPublicId(secureUrl);
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
      });

      const results = await Promise.all(deletePromises);
      return results;
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: 'Xóa ảnh không thành công',
      });
    }
  }

  async deleteVideo(secureUrl: string): Promise<{ result: string }> {
    try {
      const publicId = this.extractPublicId(secureUrl);
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'video',
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: 'Xóa video không thành công',
      });
    }
  }

  async deleteVideos(secureUrls: string[]): Promise<{ result: string }[]> {
    try {
      const deletePromises = secureUrls.map(async (secureUrl) => {
        const publicId = this.extractPublicId(secureUrl);
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: 'video',
        });
        return result;
      });

      const results = await Promise.all(deletePromises);
      return results;
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: 'Xóa video không thành công',
      });
    }
  }
}
