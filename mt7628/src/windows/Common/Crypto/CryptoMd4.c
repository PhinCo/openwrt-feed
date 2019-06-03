#include    "MtConfig.h"

/* Constants for MD4Transform routine.
 */
#define S11 3
#define S12 7
#define S13 11
#define S14 19
#define S21 3
#define S22 5
#define S23 9
#define S24 13
#define S31 3
#define S32 9
#define S33 11
#define S34 15

VOID MD4Transform (ULONG [4], UCHAR [64]);
VOID Encode (PUCHAR, ULONG *, UINT);
VOID Decode (ULONG *, PUCHAR, UINT);
VOID MD4_memcpy (PUCHAR, PUCHAR, UINT);
VOID MD4_memset(PUCHAR, INT, UINT);

UCHAR PADDING[64] = {
    0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
};

/* F, G and H are basic MD4 functions.
 */
#define F(x, y, z) (((x) & (y)) | ((~x) & (z)))
#define G(x, y, z) (((x) & (y)) | ((x) & (z)) | ((y) & (z)))
#define H(x, y, z) ((x) ^ (y) ^ (z))

/* ROTATE_LEFT rotates x left n bits.
 */
#define ROTATE_LEFT(x, n) (((x) << (n)) | ((x) >> (32-(n))))

/* FF, GG and HH are transformations for rounds 1, 2 and 3 */
/* Rotation is separate from addition to prevent recomputation */


#define FF(a, b, c, d, x, s) { \
    (a) += F ((b), (c), (d)) + (x); \
    (a) = ROTATE_LEFT ((a), (s)); \
}
#define GG(a, b, c, d, x, s) { \
    (a) += G ((b), (c), (d)) + (x) + (ULONG)0x5a827999; \
    (a) = ROTATE_LEFT ((a), (s)); \
}
#define HH(a, b, c, d, x, s) { \
    (a) += H ((b), (c), (d)) + (x) + (ULONG)0x6ed9eba1; \
    (a) = ROTATE_LEFT ((a), (s)); \
}

/* MD4 initialization. Begins an MD4 operation, writing a new context.
 */
VOID MD4Init (MD4_CTX *context) /* context */
{
    context->count[0] = context->count[1] = 0;

    /* Load magic initialization constants.
    */
    context->state[0] = 0x67452301;
    context->state[1] = 0xefcdab89;
    context->state[2] = 0x98badcfe;
    context->state[3] = 0x10325476;
}

/* MD4 block update operation. Continues an MD4 message-digest
    operation, processing another message block, and updating the
    context.
    MD4_CTX *context;                                         context
    unsigned char *input;                                     input block
    unsigned int inputLen;                                    length of input block
 */
VOID MD4Update (MD4_CTX *context, PUCHAR input, UINT inputLen)
{
    UINT i, index, partLen;

    // Compute number of bytes mod 64
    index = (UINT)((context->count[0] >> 3) & 0x3F);
    // Update number of bits
    if ((context->count[0] += ((ULONG)inputLen << 3)) < ((ULONG)inputLen << 3))
        context->count[1]++;
    context->count[1] += ((ULONG) inputLen >> 29);

    partLen = 64 - index;
    //
    // Transform as many times as possible.
    //
    if (inputLen >= partLen) 
    {
        MD4_memcpy((PUCHAR)&context->buffer[index], (PUCHAR)input, partLen);
        MD4Transform (context->state, context->buffer);

        for (i = partLen; i + 63 < inputLen; i += 64)
            MD4Transform (context->state, &input[i]);

        index = 0;
    }
    else
        i = 0;

    // Buffer remaining input
    MD4_memcpy((PUCHAR)&context->buffer[index], (PUCHAR)&input[i], inputLen-i);
}

/* MD4 finalization. Ends an MD4 message-digest operation, writing the
     the message digest and zeroizing the context.
unsigned char digest[16];                                   message digest
MD4_CTX *context;                                           context
 */
VOID MD4Final (UCHAR digest[16], MD4_CTX *context)
{
    UCHAR       bits[8];
    UINT        index, padLen;

    // Save number of bits
    Encode (bits, context->count, 8);

    //
    // Pad out to 56 mod 64.
    //
    index = (unsigned int)((context->count[0] >> 3) & 0x3f);
    padLen = (index < 56) ? (56 - index) : (120 - index);
    MD4Update (context, PADDING, padLen);

    // Append length (before padding)
    MD4Update (context, bits, 8);
    // Store state in digest
    Encode (digest, context->state, 16);

    //
    // Zeroize sensitive information.
    //
    MD4_memset ((PUCHAR)context, 0, sizeof (*context));
}

/* MD4 basic transformation. Transforms state based on block.
 */
VOID MD4Transform (ULONG state[4], UCHAR block[64])
{
    ULONG a = state[0], b = state[1], c = state[2], d = state[3], x[16];

    Decode (x, block, 64);

    // Round 1
    FF (a, b, c, d, x[ 0], S11); // 1
    FF (d, a, b, c, x[ 1], S12); // 2
    FF (c, d, a, b, x[ 2], S13); // 3
    FF (b, c, d, a, x[ 3], S14); // 4
    FF (a, b, c, d, x[ 4], S11); // 5
    FF (d, a, b, c, x[ 5], S12); // 6
    FF (c, d, a, b, x[ 6], S13); // 7
    FF (b, c, d, a, x[ 7], S14); // 8
    FF (a, b, c, d, x[ 8], S11); // 9
    FF (d, a, b, c, x[ 9], S12); // 10
    FF (c, d, a, b, x[10], S13); // 11
    FF (b, c, d, a, x[11], S14); // 12
    FF (a, b, c, d, x[12], S11); // 13
    FF (d, a, b, c, x[13], S12); // 14
    FF (c, d, a, b, x[14], S13); // 15
    FF (b, c, d, a, x[15], S14); // 16

    // Round 2
    GG (a, b, c, d, x[ 0], S21); // 17
    GG (d, a, b, c, x[ 4], S22); // 18
    GG (c, d, a, b, x[ 8], S23); // 19
    GG (b, c, d, a, x[12], S24); // 20
    GG (a, b, c, d, x[ 1], S21); // 21
    GG (d, a, b, c, x[ 5], S22); // 22
    GG (c, d, a, b, x[ 9], S23); // 23
    GG (b, c, d, a, x[13], S24); // 24
    GG (a, b, c, d, x[ 2], S21); // 25
    GG (d, a, b, c, x[ 6], S22); // 26
    GG (c, d, a, b, x[10], S23); // 27
    GG (b, c, d, a, x[14], S24); // 28
    GG (a, b, c, d, x[ 3], S21); // 29
    GG (d, a, b, c, x[ 7], S22); // 30
    GG (c, d, a, b, x[11], S23); // 31
    GG (b, c, d, a, x[15], S24); // 32

    // Round 3
    HH (a, b, c, d, x[ 0], S31); // 33
    HH (d, a, b, c, x[ 8], S32); // 34
    HH (c, d, a, b, x[ 4], S33); // 35
    HH (b, c, d, a, x[12], S34); // 36
    HH (a, b, c, d, x[ 2], S31); // 37
    HH (d, a, b, c, x[10], S32); // 38
    HH (c, d, a, b, x[ 6], S33); // 39
    HH (b, c, d, a, x[14], S34); // 40
    HH (a, b, c, d, x[ 1], S31); // 41
    HH (d, a, b, c, x[ 9], S32); // 42
    HH (c, d, a, b, x[ 5], S33); // 43
    HH (b, c, d, a, x[13], S34); // 44
    HH (a, b, c, d, x[ 3], S31); // 45
    HH (d, a, b, c, x[11], S32); // 46
    HH (c, d, a, b, x[ 7], S33); // 47
    HH (b, c, d, a, x[15], S34); // 48

    state[0] += a;
    state[1] += b;
    state[2] += c;
    state[3] += d;

    //
    // Zeroize sensitive information.
    //
    MD4_memset ((PUCHAR)x, 0, sizeof (x));
}

/* Encodes input (UINT4) into output (unsigned char). Assumes len is
     a multiple of 4.
 */
VOID Encode (PUCHAR output, ULONG *input, UINT len)
{
    UINT i, j;

    for (i = 0, j = 0; j < len; i++, j += 4) 
    {
        output[j] = (UCHAR)(input[i] & 0xff);
        output[j+1] = (UCHAR)((input[i] >> 8) & 0xff);
        output[j+2] = (UCHAR)((input[i] >> 16) & 0xff);
        output[j+3] = (UCHAR)((input[i] >> 24) & 0xff);
    }
}

/* Decodes input (unsigned char) into output (UINT4). Assumes len is
     a multiple of 4.



 */
VOID Decode (ULONG *output, PUCHAR input, UINT len)
{
    UINT    i, j;

    for (i = 0, j = 0; j < len; i++, j += 4)
        output[i] = ((ULONG)input[j]) | (((ULONG)input[j+1]) << 8) | (((ULONG)input[j+2]) << 16) | (((ULONG)input[j+3]) << 24);
}

/* Note: Replace "for loop" with standard memcpy if possible.
 */
VOID MD4_memcpy (PUCHAR output, PUCHAR input, UINT len)
{
    UINT    i;

    for (i = 0; i < len; i++)
        output[i] = input[i];
}

/* Note: Replace "for loop" with standard memset if possible.
 */
VOID MD4_memset (PUCHAR output, INT value, UINT len)
{
    UINT    i;

    for (i = 0; i < len; i++)
        ((CHAR *)output)[i] = (CHAR)value;
}