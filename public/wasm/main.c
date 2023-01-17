#include <stdint.h>
#define KERNEL_SIZE 40
#define NORMALIZATION 1600

struct objPixel
{
    uint8_t r;
    uint8_t g;
    uint8_t b;
    uint8_t a;
};
typedef struct objPixel Pixel;

int kernel[KERNEL_SIZE][KERNEL_SIZE];

void main_func(Pixel *old_buffer, unsigned int width, unsigned int height)
{
    // create kernel
    for (unsigned int i = 0; i < KERNEL_SIZE; i++)
    {
        for (unsigned int j = 0; j < KERNEL_SIZE; j++)
        {
            kernel[i][j] = 1;
        }
    }

    Pixel *new_buffer = old_buffer + width * height;
    for (unsigned int row = 0; row < height; row++)
    {
        for (unsigned int col = 0; col < width; col++)
        {
            // calculate kernel value for this row, col
            int kernel_r = 0;
            int kernel_g = 0;
            int kernel_b = 0;

            for (int i = 0; i < KERNEL_SIZE; i++)
            {
                for (int j = 0; j < KERNEL_SIZE; j++)
                {
                    int real_i = i - KERNEL_SIZE / 2;
                    int real_j = j - KERNEL_SIZE / 2;
                    if (real_i + (int)row > 0 && real_j + (int)col > 0 && real_i + (int)row < height && real_j + (int)col < width)
                    {
                        unsigned int target_index = (row + real_i) * width + col + real_j;
                        kernel_r += old_buffer[target_index].r;
                        kernel_g += old_buffer[target_index].g;
                        kernel_b += old_buffer[target_index].b;
                    }
                }
            }
            kernel_r /= NORMALIZATION;
            kernel_g /= NORMALIZATION;
            kernel_b /= NORMALIZATION;
            unsigned int index = row * width + col;
            new_buffer[index].r = (uint8_t)kernel_r;
            new_buffer[index].g = (uint8_t)kernel_g;
            new_buffer[index].b = (uint8_t)kernel_b;
            // old_buffer[row * width + col].r = 255;
        }
    }
}