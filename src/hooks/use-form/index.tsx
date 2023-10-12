import { Form } from 'antd';
import type {
  FormInstance as AntdFormInstance,
  FormItemProps as AntdFormItemProps,
  FormProps as AntdFormProps,
  RuleObject as AntdRuleObject
} from 'antd/es/form';
import * as React from 'react';

export declare type ValidatorKeys = 'required';

export declare type ValidatorRuleObject = AntdRuleObject | ((form: FormInstance) => ValidatorRule);

export declare type ValidatorRule = ValidatorRuleObject &
  {
    [name in ValidatorKeys]?: any;
  } & {
    message?: string;
  };

export declare type ValidatorRules =
  | ValidatorKeys
  | ValidatorRule
  | (ValidatorKeys | ValidatorRule)[];

export declare const DATA_FORM_COMPONENT_FIELD_ERRORS = 'data-form-component-field-errors';
export interface FormItemProps<Values = any>
  extends Record<string, any>,
    Omit<AntdFormItemProps<Values>, 'rules' | 'children'> {
  rules?: ValidatorRules;
}

export interface FormItemNode {
  [DATA_FORM_COMPONENT_FIELD_ERRORS]?: string[];
}

export type FormProps<Values = any> = AntdFormProps<Values>;

export interface FormInstance<Values = any> extends AntdFormInstance<Values> {
  createFormItem: (
    options: FormItemProps<Values>
  ) => (node?: AntdFormItemProps<Values>['children']) => React.ReactElement<any, any>;
}

const useForm = () => {
  const [form, ...otherForm] = Form.useForm();

  const createFormItem = (options: FormItemProps) => (node?: AntdFormItemProps['children']) => {
    const { rules, style, ...otherOptions } = options;
    return (
      <Form.Item
        rules={rules as AntdFormItemProps['rules']}
        style={{
          marginBottom: 0,
          width: '100%',
          ...style
        }}
        {...otherOptions}
      >
        {node}
      </Form.Item>
    );
  };

  Object.defineProperty(form, 'createFormItem', {
    value: createFormItem,
    writable: false,
    configurable: true
  });
  return [...otherForm, form as FormInstance];
};

export default useForm;