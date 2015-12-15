// Generated by CoffeeScript 1.10.0

/*
@author  Oleg Mazko <o.mazko@mail.ru>
@license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

(function() {
  var ResolveThisVisitor, Scope, SuperVisitor, estypes,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  estypes = require('ast-types');

  SuperVisitor = require('./KeywordsVisitor');

  Scope = require('./binding/BindingScope');

  ResolveThisVisitor = (function(superClass) {
    var builders;

    extend(ResolveThisVisitor, superClass);

    function ResolveThisVisitor() {
      return ResolveThisVisitor.__super__.constructor.apply(this, arguments);
    }

    builders = estypes.builders;

    ResolveThisVisitor.prototype.visitSimpleName = function() {
      var args, binding, expr, node, resolved, su;
      node = arguments[0], binding = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      su = ResolveThisVisitor.__super__.visitSimpleName.apply(this, [node, binding].concat(slice.call(args)));
      resolved = binding != null ? binding.resolve_id(su) : void 0;
      if (Scope.FIELD === (resolved != null ? resolved.scope : void 0)) {
        if (resolved.is_static) {
          expr = binding.class_id;
        } else {
          expr = builders.thisExpression();
        }
        return builders.memberExpression(expr, su, false);
      } else {
        return su;
      }
    };

    ResolveThisVisitor.prototype.visitQualifiedName = function() {
      var args, binding, node, su;
      node = arguments[0], binding = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      su = ResolveThisVisitor.__super__.visitQualifiedName.apply(this, [node, binding].concat(slice.call(args)));
      return function(lazy) {
        return su(function(object, property) {
          if (property.object && property.object === (binding != null ? binding.class_id : void 0)) {
            property = property.property;
          }
          return lazy(object, property);
        });
      };
    };

    ResolveThisVisitor.prototype.visitFieldAccess = function() {
      var args, binding, node, su;
      node = arguments[0], binding = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      su = ResolveThisVisitor.__super__.visitFieldAccess.apply(this, [node, binding].concat(slice.call(args)));
      return function(lazy) {
        return su(function(id, expr) {
          var ref, resolved, ugly_expr, ugly_id;
          if (((ref = id.object) != null ? ref.type : void 0) === 'ThisExpression') {
            ugly_id = id.property;
            ugly_expr = id.object;
            resolved = binding.resolve_id(ugly_id);
            if (Scope.FIELD === (resolved != null ? resolved.scope : void 0)) {
              return lazy(ugly_id, ugly_expr);
            }
          } else if (expr.type === 'ThisExpression' && binding.class_id === id.object) {
            return lazy(id.property, expr);
          }
          return lazy(id, expr);
        });
      };
    };

    ResolveThisVisitor.prototype.visitMethodInvocation = function() {
      var args, binding, node, su;
      node = arguments[0], binding = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      su = ResolveThisVisitor.__super__.visitMethodInvocation.apply(this, [node, binding].concat(slice.call(args)));
      return function(lazy) {
        return su(function(id, params, expr) {
          var resolved;
          resolved = binding.resolve_id(id);
          if (!expr && Scope.METHOD === (resolved != null ? resolved.scope : void 0)) {
            if (resolved.is_static) {
              expr = binding.class_id;
            } else {
              expr = builders.thisExpression();
            }
          }
          return lazy(id, params, expr);
        });
      };
    };

    return ResolveThisVisitor;

  })(SuperVisitor);

  module.exports = ResolveThisVisitor;

}).call(this);
