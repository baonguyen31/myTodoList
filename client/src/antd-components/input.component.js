import { Input } from 'antd';
import _ from 'lodash-es';
import { forwardRef } from 'react';

const TextField = forwardRef((props, ref) => <Input ref={ref} {...props} />);

// Forward all static properties from Input to TextField
_.forEach(Object.keys(Input), key => {
  TextField[key] = Input[key];
});

export { Input };
export { TextField };
