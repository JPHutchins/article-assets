main:
        push    {fp, lr}
        add     fp, sp, #4
        sub     sp, sp, #40
        str     r0, [fp, #-40]
        str     r1, [fp, #-44]
        sub     r3, fp, #36
        ldr     r1, [fp, #-40]
        mov     r0, r3
        bl      return_value
        sub     r2, fp, #36
        sub     r3, fp, #36
        mov     r1, r2
        mov     r0, r3
        bl      func_to_prevent_optimizations
        mov     r3, #0
        mov     r0, r3
        sub     sp, fp, #4
        pop     {fp, lr}
        bx      lr

main:
        push    {fp, lr}
        add     fp, sp, #4
        sub     sp, sp, #40
        str     r0, [fp, #-40]
        str     r1, [fp, #-44]
        sub     r3, fp, #36
        ldr     r1, [fp, #-40]
        mov     r0, r3
        bl      out_param
        sub     r2, fp, #36
        sub     r3, fp, #36
        mov     r1, r2
        mov     r0, r3
        bl      func_to_prevent_optimizations
        mov     r3, #0
        mov     r0, r3
        sub     sp, fp, #4
        pop     {fp, lr}
        bx      lr



main:
        str     lr, [sp, #-4]!
        sub     sp, sp, #36
        mov     r1, r0
        mov     r0, sp
        bl      return_value
        mov     r1, sp
        mov     r0, r1
        bl      func_to_prevent_optimizations
        mov     r0, #0
        add     sp, sp, #36
        ldr     lr, [sp], #4
        bx      lr



main:
        str     lr, [sp, #-4]!
        sub     sp, sp, #36
        mov     r1, r0
        mov     r0, sp
        bl      out_param
        mov     r1, sp
        mov     r0, r1
        bl      func_to_prevent_optimizations
        mov     r0, #0
        add     sp, sp, #36
        ldr     lr, [sp], #4
        bx      lr