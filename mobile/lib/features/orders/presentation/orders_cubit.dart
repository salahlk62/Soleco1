import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

abstract class OrdersState extends Equatable {
  @override
  List<Object?> get props => [];
}

class OrdersInitial extends OrdersState {}

class OrdersLoading extends OrdersState {}

class OrdersLoaded extends OrdersState {
  final List<dynamic> orders;
  final int pendingCount;

  OrdersLoaded({required this.orders, required this.pendingCount});

  @override
  List<Object?> get props => [orders, pendingCount];
}

class OrdersError extends OrdersState {
  final String message;
  OrdersError(this.message);

  @override
  List<Object?> get props => [message];
}

class OrdersCubit extends Cubit<OrdersState> {
  final dynamic ordersRepository; // يُحقن عبر Dependency Injection (get_it / provider)

  OrdersCubit(this.ordersRepository) : super(OrdersInitial());

  Future<void> fetchOrders() async {
    emit(OrdersLoading());
    try {
      final orders = await ordersRepository.getOrders();
      final pendingCount = orders.where((o) => o['status'] == 'PENDING').length;
      emit(OrdersLoaded(orders: orders, pendingCount: pendingCount));
    } catch (e) {
      emit(OrdersError('تعذر تحميل الطلبات، يرجى إعادة المحاولة'));
    }
  }

  /// إدراج طلب جديد فوراً في الواجهة عند وصول إشعار WebSocket/FCM
  void addNewOrderRealtime(Map<String, dynamic> newOrder) {
    final current = state;
    if (current is OrdersLoaded) {
      final updatedOrders = [newOrder, ...current.orders];
      emit(OrdersLoaded(orders: updatedOrders, pendingCount: current.pendingCount + 1));
    }
  }
}
