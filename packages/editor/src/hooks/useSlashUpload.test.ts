import { describe, it, expect } from 'vitest';
import {
    getMediaType,
    createOptimisticImagePayload,
    createOptimisticVideoPayload,
    createOptimisticFilePayload,
} from './useSlashUpload';

describe('useSlashUpload utilities', () => {
    describe('getMediaType', () => {
        it('returns image for image/jpeg', () => {
            const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
            expect(getMediaType(file)).toBe('image');
        });

        it('returns image for image/png', () => {
            const file = new File([''], 'test.png', { type: 'image/png' });
            expect(getMediaType(file)).toBe('image');
        });

        it('returns video for video/mp4', () => {
            const file = new File([''], 'test.mp4', { type: 'video/mp4' });
            expect(getMediaType(file)).toBe('video');
        });

        it('returns video for video/webm', () => {
            const file = new File([''], 'test.webm', { type: 'video/webm' });
            expect(getMediaType(file)).toBe('video');
        });

        it('returns file for application/pdf', () => {
            const file = new File([''], 'test.pdf', { type: 'application/pdf' });
            expect(getMediaType(file)).toBe('file');
        });

        it('returns file for text/plain', () => {
            const file = new File([''], 'test.txt', { type: 'text/plain' });
            expect(getMediaType(file)).toBe('file');
        });

        it('returns file for unknown types', () => {
            const file = new File([''], 'test.xyz', { type: 'application/octet-stream' });
            expect(getMediaType(file)).toBe('file');
        });
    });

    describe('createOptimisticImagePayload', () => {
        it('creates image payload with status uploading', () => {
            const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
            const result = createOptimisticImagePayload(file, 'blob:preview');

            expect(result.src).toBe('blob:preview');
            expect(result.alt).toBe('photo.jpg');
            expect(result.status).toBe('uploading');
        });

        it('uses filename as alt', () => {
            const file = new File([''], 'my-image.png', { type: 'image/png' });
            const result = createOptimisticImagePayload(file, 'blob:url');
            expect(result.alt).toBe('my-image.png');
        });
    });

    describe('createOptimisticVideoPayload', () => {
        it('creates video payload with html5 provider', () => {
            const file = new File(['video'], 'movie.mp4', { type: 'video/mp4' });
            const result = createOptimisticVideoPayload(file, 'blob:video');

            expect(result.src).toBe('blob:video');
            expect(result.provider).toBe('html5');
            expect(result.title).toBe('movie.mp4');
            expect(result.status).toBe('uploading');
        });
    });

    describe('createOptimisticFilePayload', () => {
        it('creates file payload with all properties', () => {
            const file = new File(['pdf content'], 'document.pdf', {
                type: 'application/pdf',
            });
            // Mock file size
            Object.defineProperty(file, 'size', { value: 12345 });

            const result = createOptimisticFilePayload(file, 'blob:file');

            expect(result.url).toBe('blob:file');
            expect(result.filename).toBe('document.pdf');
            expect(result.size).toBe(12345);
            expect(result.mime).toBe('application/pdf');
            expect(result.status).toBe('uploading');
        });
    });
});
