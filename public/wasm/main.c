#include <stdint.h>

struct objPixel
{
    uint8_t r;
    uint8_t g;
    uint8_t b;
    uint8_t a;
};
typedef struct objPixel Pixel;

char *c_hello(Pixel *buffer, unsigned int img_width, unsigned int img_height)
{
    for (unsigned int row = 0; row < img_height; row++)
    {
        for (unsigned int col = 0; col < img_width; col++)
        {
            buffer[row * img_width + col].r = 255;
        }
    }
    return "fuckin hell";
}