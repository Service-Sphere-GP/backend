import { UsersService } from "./users.service";

describe('updateCustomer', () => {
  let service: UsersService;
  let mockUserModel: any;

  beforeEach(() => {
    mockUserModel = {
      findByIdAndUpdate: jest.fn(),
    };

    service = new UsersService(mockUserModel);
  });

  it('should update customer and return the updated user with computed full_name', async () => {
    const id = '123';
    const updateData = { first_name: 'John', last_name: 'Doe' };
    const expectedUser = { _id: id, first_name: 'John', last_name: 'Doe', full_name: 'John Doe' };

    // Mock findByIdAndUpdate to return an object with exec method that resolves to expectedUser
    mockUserModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(expectedUser),
    });

    const updatedUser = await service.updateCustomer(id, updateData);
    
    // Assert that full_name was computed
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { ...updateData, full_name: 'John Doe' },
      { new: true }
    );
    expect(updatedUser).toEqual(expectedUser);
  });
});