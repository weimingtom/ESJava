// Generated by CoffeeScript 1.10.0

/*
@author  Oleg Mazko <o.mazko@mail.ru>
@license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

(function() {
  var BindingVisitor, CUBinding, GenericVisitor, estypes,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  GenericVisitor = require('./GenericVisitor').GenericVisitor;

  CUBinding = require('./binding/CUNaiveBinding');

  estypes = require('ast-types');

  BindingVisitor = (function(superClass) {
    var builders, flatten, make_method, make_static_get, make_static_set, make_this_get, make_this_set;

    extend(BindingVisitor, superClass);

    function BindingVisitor() {
      return BindingVisitor.__super__.constructor.apply(this, arguments);
    }

    builders = estypes.builders;

    make_method = function(id, params, body, is_static, kind) {
      var fn;
      if (is_static == null) {
        is_static = false;
      }
      if (kind == null) {
        kind = 'method';
      }
      fn = builders.functionDeclaration(id, params, body);
      return builders.methodDefinition(kind, id, fn, is_static);
    };

    make_static_get = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return make_method.apply(null, slice.call(args).concat([true], ['get']));
    };

    make_static_set = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return make_method.apply(null, slice.call(args).concat([true], ['set']));
    };

    make_this_get = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return make_method.apply(null, slice.call(args).concat([false], ['get']));
    };

    make_this_set = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return make_method.apply(null, slice.call(args).concat([false], ['set']));
    };

    flatten = function(array_of_array) {
      return [].concat.apply([], array_of_array);
    };

    BindingVisitor.prototype.visitCompilationUnit = function() {
      var args, binding, node;
      node = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      binding = new CUBinding(node);
      return BindingVisitor.__super__.visitCompilationUnit.apply(this, [node, binding].concat(slice.call(args)));
    };

    BindingVisitor.prototype.visitTypeDeclaration = function() {
      var args, binding, node, su;
      node = arguments[0], binding = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      binding.checkout_type(node);
      su = BindingVisitor.__super__.visitTypeDeclaration.apply(this, [node, binding].concat(slice.call(args)));
      return function(lazy) {
        return su(function(id, decls, su) {
          decls = flatten(decls);
          return lazy(id, decls, su, binding);
        });
      };
    };

    BindingVisitor.prototype.visitFieldDeclaration = function() {
      var args, binding, body, body_set, decl, del, esid, expr, fragment, frags, getter, is_prim, node, operand, param, type;
      node = arguments[0], binding = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      type = this.visit.apply(this, [node.type, binding].concat(slice.call(args)));
      frags = (function() {
        var i, len, ref, ref1, results;
        ref = node.fragments;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          fragment = ref[i];
          decl = this.visit.apply(this, [fragment, binding].concat(slice.call(args)));
          if (decl.init == null) {
            decl.init = this.visit.apply(this, [this.constructor.make_def_field_init(node), binding].concat(slice.call(args)));
          }
          if (this.constructor.has_modifier(node, 'static')) {
            is_prim = (ref1 = type.name) === 'long' || ref1 === 'byte' || ref1 === 'int' || ref1 === 'short' || ref1 === 'double' || ref1 === 'float' || ref1 === 'boolean' || ref1 === 'String' || ref1 === 'char';
            if (is_prim && !fragment.extraDimensions && this.constructor.has_modifier(node, 'final')) {
              body = builders.blockStatement([builders.returnStatement(decl.init)]);
              results.push(make_static_get(decl.id, [], body));
            } else {
              operand = builders.memberExpression(binding.class_id, decl.id, false);
              del = builders.unaryExpression('delete', operand, false);
              del = builders.expressionStatement(del);
              expr = builders.assignmentExpression('=', operand, decl.init);
              body = builders.blockStatement([del, builders.returnStatement(expr)]);
              getter = make_static_get(decl.id, [], body);
              if (!this.constructor.has_modifier(node, 'final')) {
                param = builders.identifier('value');
                expr = builders.assignmentExpression('=', operand, param);
                expr = builders.expressionStatement(expr);
                body_set = builders.blockStatement([del, expr]);
                results.push([getter, make_static_set(decl.id, [param], body_set)]);
              } else {
                results.push(getter);
              }
            }
          } else {
            esid = builders.identifier("_$esjava$" + decl.id.name);
            operand = builders.memberExpression(builders.thisExpression(), esid, false);
            expr = builders.identifier('Object.prototype.hasOwnProperty.call');
            expr = builders.callExpression(expr, [builders.thisExpression(), builders.literal(esid.name)]);
            expr = builders.conditionalExpression(expr, operand, decl.init);
            body = builders.blockStatement([builders.returnStatement(expr)]);
            getter = make_this_get(decl.id, [], body);
            param = builders.identifier('value');
            expr = builders.assignmentExpression('=', operand, param);
            expr = builders.expressionStatement(expr);
            body_set = builders.blockStatement([expr]);
            results.push([getter, make_this_set(decl.id, [param], body_set)]);
          }
        }
        return results;
      }).call(this);
      return flatten(frags);
    };

    BindingVisitor.prototype.visitSimpleName = function() {
      var args, binding, node, su;
      node = arguments[0], binding = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      su = BindingVisitor.__super__.visitSimpleName.apply(this, [node, binding].concat(slice.call(args)));
      if (binding) {
        binding.bind({
          id: su,
          foreign: node
        });
      }
      return su;
    };

    return BindingVisitor;

  })(GenericVisitor);

  module.exports = BindingVisitor;

}).call(this);
