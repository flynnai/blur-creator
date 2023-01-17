#include <stdint.h>

struct objPixel
{
    uint8_t r;
    uint8_t g;
    uint8_t b;
    uint8_t a;
};
typedef struct objPixel Pixel;

void main_func(Pixel *old_buffer, unsigned int width, unsigned int height)
{
    Pixel *new_buffer = old_buffer + width * height;
    for (unsigned int row = 0; row < height; row++)
    {
        for (unsigned int col = 0; col < width; col++)
        {
            unsigned int index = row * width + col;
            unsigned int avg = (old_buffer[index].r + old_buffer[index].g + old_buffer[index].b) / 3;
            new_buffer[index].r = avg;
            new_buffer[index].g = avg;
            new_buffer[index].b = avg;
            // old_buffer[row * width + col].r = 255;
        }
    }
}