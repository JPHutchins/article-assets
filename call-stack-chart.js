/**
 * Copyright (c) 2024 github.com/sparklerfish & github.com/JPHutchins
 * SPDX-License-Identifier: Apache-2.0
 */

const RETURN_VARIABLE = 'Return Value';
const BEFORE_CALL = 'Before Call';
const DURING_CALL = 'During Call';
const AFTER_CALL = 'After Call';

const argumentTypeNames = {
    title: 'string',
    returnValueSize: 'number',
    returnValueOnCallStack: 'boolean',
    callArgs: 'object',
    linkRegister: 'boolean',
    padding: 'number',
    yMax: 'number',
};

/**
 * @typedef {Object} ArgumentType
 * @property {string} title
 * @property {number} returnValueSize
 * @property {boolean} returnValueOnCallStack
 * @property {Array<{name: string, size: number, color: string}>} callArgs
 * @property {boolean} linkRegister
 * @property {number} padding
 * @property {number} yMax
 */

/**
 * Create a call stack chart.
 * 
 * @param {ArgumentType} options - The options for creating the call stack chart.
 * @param {string} options.title - The title of the chart.
 * @param {number} options.returnValueSize - The size of the return value.
 * @param {boolean} options.returnValueOnCallStack - Whether the return value is on the call stack.
 * @param {Array<{name: string, size: number, color: string}>} options.callArgs - The arguments of the function call.
 * @param {boolean} options.linkRegister - Whether the link register is used.
 * @param {number} options.padding - The padding size.
 * @param {number} options.yMax - The maximum value for the y-axis.
 */

export const createCallStackChart = (options) => {
    Object.entries(argumentTypeNames).forEach(([arg, type]) => {
        if (typeof options[arg] !== type) {
            throw new Error(`Expected ${arg} to be of type ${type}`);
        }
    });

    const { 
        title,
        returnValueSize,
        returnValueOnCallStack,
        callArgs,
        linkRegister,
        padding,
        yMax,
    } = options;

    const callStackFrameSize = 0
        + returnValueSize * (returnValueOnCallStack ? 1 : 0) 
        + callArgs.reduce((acc, {size}) => acc + size, 0)
        + (linkRegister ? 4 : 0)
        + 4 // Frame Pointer
        + padding;

    const layout = {
        barmode: 'stack',
        title: title,
        xaxis: {
            title: 'Call State',
        },
        yaxis: {
            title: 'Stack Usage (Bytes)',
            range: [0, yMax],
        },
        showlegend: false,
        uniformtext: {
            mode: 'hide',
            minsize: 8,
        },
        annotations: [
            {
                x: 0.33,
                y: returnValueSize + callStackFrameSize / 2,
                xref: 'paper',
                yref: 'y',
                text: 'Function Call',
                showarrow: false,
                font: {
                    color: 'grey',
                    size: 12,
                },
                textangle: 270,
            },
            {
                x: 0.5,
                y: returnValueSize + callStackFrameSize + 2,
                xref: 'paper',
                yref: 'y',
                text: `${callStackFrameSize} Bytes`,
                showarrow: false,
                font: {
                    color: 'grey',
                    size: 12,
                },
            },
        ],
        shapes: [
            {
                type: 'line',
                x0: 0,
                y0: returnValueSize,
                x1: 1,
                y1: returnValueSize,
                xref: 'paper',
                yref: 'y',
                line: {
                    color: 'black',
                    width: 2,
                },
            },
            {
                type: 'rect',
                x0: 0.45,
                x1: 1.54,
                y0: returnValueSize - 4,
                y1: returnValueSize + callStackFrameSize + 4,
                xref: 'x',
                yref: 'y',
                line: {
                    color: 'grey',
                    width: 2,
                    dash: 'dot',
                },
            },
        ],
    };

    const barStack = (x, y, color, text) => ({
        x: [x],
        y: [y],
        type: 'bar',
        hoverinfo: 'y',
        marker: {
            color: color,
            line: {
                color: 'black',
                width: 1
            },
        },
        textposition: 'inside',
        insidetextanchor: 'middle',
        text,
    });

    Plotly.newPlot(
        'call-stack-chart',
        [
            barStack(BEFORE_CALL, returnValueSize, 'lightgrey', RETURN_VARIABLE),
            barStack(DURING_CALL, returnValueSize, returnValueOnCallStack ? 'lightgrey' : 'lightblue', RETURN_VARIABLE),
            ...(linkRegister ? [barStack(DURING_CALL, 4, 'lightgreen', 'Link Register')] : []),
            barStack(DURING_CALL, 4, 'lightgreen', 'Frame Pointer'),
            ...callArgs.map(({ name, size, color }, index) => barStack(DURING_CALL, size, color, `Argument ${index} (${name})`)),
            ...(returnValueOnCallStack ? [barStack(DURING_CALL, returnValueSize, 'lightblue', 'Return Value')] : []),
            barStack(DURING_CALL, padding, 'white', 'Padding'),
            barStack(AFTER_CALL, returnValueSize, 'lightblue', RETURN_VARIABLE)
        ],
        layout,
        {
            responsive: true,
            displayModeBar: false,
            staticPlot: true,
        },
    );
};
