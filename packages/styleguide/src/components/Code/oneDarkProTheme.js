const theme = {
  plain: {
    color: 'rgb(171, 178, 191)',
    backgroundColor: 'rgb(40, 44, 52)',
  },
  styles: [
    {
      types: ['punctuation', 'number'],
      style: {
        color: 'rgb(209, 154, 102)',
      },
    },
    {
      types: ['constant'],
      style: {
        color: 'rgb(255, 255, 255)',
      },
    },
    {
      types: ['char'],
      style: {
        color: 'rgb(97, 175, 239)',
      },
    },
    {
      types: ['keyword', 'selector'],
      style: {
        color: 'rgb(198, 120, 221)',
      },
    },
    {
      types: ['class-name', 'attr-name', 'string', 'symbol'],
      style: {
        color: 'rgb(86, 182, 194)',
      },
    },
    {
      types: ['function', 'builtin', 'namespace', 'changed'],
      style: {
        color: 'rgb(229, 192, 123)',
      },
    },
    {
      types: ['variable', 'tag', 'deleted'],
      style: {
        color: 'rgb(224, 108, 117)',
      },
    },
    {
      types: ['operator'],
      style: {
        color: 'rgb(171, 178, 191)',
      },
    },
    {
      types: ['inserted'],
      style: {
        color: 'rgb(152, 195, 121)',
      },
    },
    {
      types: ['comment'],
      style: {
        fontStyle: 'italic',
      },
    },
  ],
};

export default theme;
