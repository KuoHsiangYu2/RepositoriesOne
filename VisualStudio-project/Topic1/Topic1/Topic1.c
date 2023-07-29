// https://www.facebook.com/groups/1403852566495675/posts/3496018010612443/
// �j�Ǧn�I�ڬO�@��C�y�����޷s�I�̪񦬨�F�@�ӷs���D�ءG
// �H����J10�ӼƦr�A�N�o�ǼƦr�Ѥj�ƨ�p�ƦC�C
// �쩳�n���ΰڡA�گu���Q����I�нЦU��j�j���ѷQ�k�I

#define _CRT_SECURE_NO_WARNINGS
#define TRUE 1
#define FALSE 0

#include <stdio.h>
#include <stdlib.h>

void sort(int data[], int length);
void reverse(int data[], int length);

int main(int argc, char *argv) {
    int data[10] = { 0 };

    // �H����J10�ӼƦr.
    for (int i = 0; i < 10; ++i) {
        printf("%02d. ", (i + 1));
        scanf("%d", &data[i]);
    }

    // �N�o�ǼƦr�Ѥp�ƨ�j�ƦC.
    sort(data, 10);

    // �}�C����A�ܦ��Ѥj�ƨ�p.
    reverse(data, 10);

    // ��X���G.
    for (int i = 0; i < 10; ++i) {
        printf("%2d ", data[i]);
    }
    printf("\n");

    return 0;
}

void sort(int data[], int length) {
    int temp = 0;
    for (int i = 0; i < (length - 1); i++) {
        for (int j = i + 1; j < length; j++) {
            if (data[i] > data[j]) {
                temp = data[i];
                data[i] = data[j];
                data[j] = temp;
            }
        }
    }
}

void reverse(int data[], int length) {
    int i = 0, temp = 0;
    for (i = 0; i < length / 2; i++) {
        temp = data[i];
        data[i] = data[length - 1 - i];
        data[length - 1 - i] = temp;
    }
}
